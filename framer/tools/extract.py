#!/usr/bin/env python3
"""Extract content from the static portfolio (framer/source) into Framer-ready inputs.

Outputs:
  framer/cms/projects.csv       -> import into a Framer CMS collection ("Projects")
  framer/content/<slug>.md      -> section-by-section copy deck for each case study

Usage:
  python3 framer/tools/extract.py [--base-url https://raw.githubusercontent.com/<owner>/<repo>/<branch>/framer/source]

Framer's CSV importer fetches image fields by URL, so pass --base-url pointing at a
publicly reachable copy of framer/source (or leave it empty and upload images by hand).
"""
import argparse
import csv
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "source"
ORDER = ["ibm", "adobe", "haven", "wopet"]

# Layout blocks in the case-study HTML and the Framer component each maps to.
BLOCKS = {
    "stat-row": "StatRow",
    "img-grid": "ImageGrid",
    "stacked-images": "ImageStack",
    "two-col": "TwoColumn",
    "reflection": "Reflection",
    "fan-stack": "FanStack",
    "figma-embed": "Embed (Figma prototype)",
    "quote-row": "QuoteRow",
}


def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


def asset_url(src, base):
    path = src.replace("../", "")
    return f"{base.rstrip('/')}/{path}" if base else path


def home_cards():
    soup = BeautifulSoup((SRC / "index.html").read_text(), "html.parser")
    cards = {}
    for a in soup.select("a.project-card"):
        slug = Path(a["href"]).stem
        img = a.select_one(".thumb img")
        cards[slug] = {
            "card_title": clean(a.h3.text),
            "tag_line": clean(a.select_one(".tag-line").text),
            "card_desc": clean(a.select_one(".desc").text),
            "thumbnail": img["src"],
            "thumbnail_alt": img.get("alt", ""),
        }
    return cards


def inline_md(el):
    """Render a paragraph/li to Markdown, keeping bold and highlight colours visible."""
    out = []
    for node in el.children:
        if getattr(node, "name", None) is None:
            out.append(str(node))
        elif node.name == "strong":
            out.append(f"**{clean(node.text)}**")
        elif node.name == "a":
            out.append(f"[{clean(node.text)}]({node.get('href')})")
        elif node.name == "span" and "highlight" in node.get("class", []):
            colour = next((c.split("-")[1] for c in node["class"] if c.startswith("highlight-")), None)
            out.append(f"**{clean(node.text)}**" + (f"{{{colour}}}" if colour else ""))
        else:
            out.append(node.get_text())
    return clean("".join(out))


def rich_html(section):
    """Rich-text HTML for Framer's formatted-text field (headings, paragraphs, lists, images)."""
    parts = []
    for el in section.find_all(["h2", "p", "ul", "img"]):
        if el.name == "img":
            parts.append(f'<img src="{el["src"]}" alt="{el.get("alt", "")}">')
        else:
            parts.append(str(el))
    return "\n".join(parts)


def case_study(slug, base):
    soup = BeautifulSoup((SRC / "work" / f"{slug}.html").read_text(), "html.parser")
    main = soup.select_one("main")
    meta = {clean(d.select_one(".label").text): clean(d.select_one(".value").text)
            for d in main.select(".meta-grid > div")}
    hero = main.select_one(".case-hero img")
    next_link = main.select(".case-nav a")[-1]

    md = [f"# {clean(main.h1.text)}", "", f"_{clean(main.select_one('.case-title .sub').text)}_", ""]
    md += [f"| {k} | {v} |" for k, v in meta.items()]
    md.insert(4, "| Field | Value |\n|---|---|")
    md += ["", f"**Hero image:** `{asset_url(hero['src'], base)}`", ""]

    body_html = []
    for sec in main.select("section.case-section"):
        md += [f"## {clean(sec.h2.text)}", ""]
        body_html.append(rich_html(sec))
        for el in sec.find_all(["p", "ul", "div", "img", "iframe"], recursive=True):
            cls = el.get("class", [])
            block = next((BLOCKS[c] for c in cls if c in BLOCKS), None)
            if block:
                md += [f"> **[Component: {block}]**", ""]
                if block.startswith("Embed"):
                    md += [f"> embed url: {el.iframe['src']}", ""]
                elif block == "StatRow":
                    for box in el.select(".stat-box"):
                        md += [f"> - {clean(box.select_one('.num').text)} — {clean(box.select_one('.label').text)}"
                               f" ({'filled' if 'filled' in box['class'] else 'outline'})"]
                    md.append("")
                elif block == "QuoteRow":
                    for q in el.select(".quote-card"):
                        md += [f"> - {clean(q.get_text(' '))}"]
                    md.append("")
                else:
                    for img in el.find_all("img"):
                        md += [f"> - `{asset_url(img['src'], base)}` — {img.get('alt', '')}"]
                    md.append("")
            elif el.name == "p" and not el.find_parent(class_=list(BLOCKS)) or (
                    el.name == "p" and el.find_parent(class_=["two-col", "reflection"])):
                if not el.find_parent(class_=["stat-box", "quote-card"]):
                    md += [inline_md(el), ""]
            elif el.name == "ul" and not el.find_parent(class_=list(BLOCKS)):
                md += [f"- {inline_md(li)}" for li in el.find_all("li")] + [""]
            elif el.name == "img" and el.parent is sec:
                md += [f"![{el.get('alt', '')}]({asset_url(el['src'], base)})", ""]

    md += ["---", f"Case nav → **{clean(next_link.text)}** (`/work/{Path(next_link['href']).stem}`)"]
    (ROOT / "content").mkdir(exist_ok=True)
    (ROOT / "content" / f"{slug}.md").write_text("\n".join(md) + "\n")

    return {
        "title": clean(main.h1.text),
        "subtitle": clean(main.select_one(".case-title .sub").text),
        "role": meta.get("Role", ""),
        "timeline": meta.get("Timeline", ""),
        "tools": meta.get("Tools", ""),
        "category": meta.get("Category", ""),
        "hero": asset_url(hero["src"], base),
        "body": "\n".join(body_html).replace('src="../', f'src="{base.rstrip("/")}/' if base else 'src="'),
        "next": Path(next_link["href"]).stem,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="")
    base = ap.parse_args().base_url

    cards = home_cards()
    (ROOT / "cms").mkdir(exist_ok=True)
    fields = ["Title", "Slug", "Order", "Card Title", "Tag Line", "Card Description", "Thumbnail",
              "Thumbnail Alt", "Subtitle", "Role", "Timeline", "Tools", "Category", "Hero Image",
              "Next Project", "Body"]
    with open(ROOT / "cms" / "projects.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields)
        for i, slug in enumerate(ORDER, 1):
            c, cs = cards[slug], case_study(slug, base)
            w.writerow([cs["title"], slug, i, c["card_title"], c["tag_line"], c["card_desc"],
                        asset_url(c["thumbnail"], base), c["thumbnail_alt"], cs["subtitle"], cs["role"],
                        cs["timeline"], cs["tools"], cs["category"], cs["hero"], cs["next"], cs["body"]])
    print(f"Wrote cms/projects.csv and content/*.md for {len(ORDER)} projects")


if __name__ == "__main__":
    main()
