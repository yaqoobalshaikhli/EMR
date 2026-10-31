#!/usr/bin/env python3
"""Pattern scanner for AI-style writing signals.

Usage: python3 scan.py <file.txt|.md|.docx|.pdf>   (prints JSON)

This counts surface patterns. It does NOT measure authorship and its
thresholds are not calibrated against labelled data.
"""
import json, re, sys, subprocess, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

STOCK_WORDS = [
    "additionally", "boasts", "bolstered", "crucial", "delve", "emphasizing",
    "enduring", "garner", "intricate", "intricacies", "interplay", "landscape",
    "meticulously", "pivotal", "underscore", "underscores", "tapestry",
    "testament", "vibrant", "fostering", "foster", "showcasing", "highlighting",
    "leverage", "multifaceted", "seamlessly", "groundbreaking", "renowned",
    "nestled", "empowering", "holistic", "robust",
]
PHRASES = {
    "significance inflation": r"\b(is|are|was|were|stands as|serves as) a (testament|reminder)\b|\bindelible mark\b|\bkey turning point\b|\bdeeply rooted\b",
    "copula avoidance": r"\b(serves as|stands as|functions as|operates as)\b",
    "negative parallelism": r"\bnot (only|just)\b[^.]{0,80}\b(but|it'?s)\b|\bit'?s not\b[^.]{0,60},\s*it'?s\b",
    "challenge formula": r"\bdespite (these|its|the)\b[^.]{0,40}\bchallenges?\b",
    "vague attribution": r"\b(experts|observers|critics|industry reports?|studies) (argue|suggest|have (noted|cited)|say)\b",
    "hollow hedge opener": r"\b(it'?s|it is) (important|worth) (to note|noting)\b",
    "announcement opener": r"\bin this (essay|article|post|paper|document), we (will|shall)\b",
    "chatbot leftover": r"\b(i hope this helps|as an ai|certainly!|let me know if you'?d like)\b",
}
ING_TACKON = re.compile(r",\s+(highlighting|underscoring|emphasizing|showcasing|reflecting|ensuring|contributing to|fostering|demonstrating)\b", re.I)
SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")


def extract(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in (".txt", ".md", ".markdown", ""):
        return path.read_text(errors="replace")
    if ext == ".docx":
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        with zipfile.ZipFile(path) as z:
            root = ET.fromstring(z.read("word/document.xml"))
        paras = []
        for p in root.iter("{%s}p" % ns["w"]):
            paras.append("".join(t.text or "" for t in p.iter("{%s}t" % ns["w"])))
        return "\n\n".join(paras)
    if ext == ".pdf":
        try:
            out = subprocess.run(["pdftotext", "-layout", str(path), "-"],
                                 capture_output=True, text=True, check=True).stdout
        except (FileNotFoundError, subprocess.CalledProcessError):
            from pypdf import PdfReader
            out = "\n\n".join((pg.extract_text() or "") for pg in PdfReader(str(path)).pages)
        if len(out.strip()) < 50:
            sys.exit("ERROR: PDF has no readable text layer (scanned?). Cannot scan.")
        return out
    sys.exit(f"ERROR: unsupported file type {ext}")


def analyse(par: str) -> dict:
    low = par.lower()
    words = re.findall(r"[A-Za-z']+", par)
    sents = [s for s in SENT_SPLIT.split(par.strip()) if s]
    lens = [len(re.findall(r"[A-Za-z']+", s)) for s in sents] or [0]
    mean = sum(lens) / len(lens)
    var = sum((l - mean) ** 2 for l in lens) / len(lens)
    stock = sorted({w for w in STOCK_WORDS if re.search(rf"\b{w}\b", low)})
    phr = {k: len(re.findall(v, low)) for k, v in PHRASES.items()}
    phr = {k: v for k, v in phr.items() if v}
    ing = len(ING_TACKON.findall(par))
    dashes = par.count("—")
    bold = len(re.findall(r"\*\*[^*]+\*\*", par))
    signals = len(stock) + sum(phr.values()) + ing + max(0, dashes - 1) + max(0, bold - 2)
    n = max(len(words), 1)
    density = signals / n * 100  # signals per 100 words
    uniform = len(sents) >= 4 and var < 6  # very even sentence lengths
    if len(words) < 25:
        rating = "too short to judge"
    elif density >= 4 or signals >= 5:
        rating = "high"
    elif density >= 2 or signals >= 3:
        rating = "medium"
    else:
        rating = "low"
    return {
        "words": len(words), "rating": rating, "signals": signals,
        "signals_per_100_words": round(density, 1),
        "stock_words": stock, "phrase_patterns": phr, "ing_tackons": ing,
        "em_dashes": dashes, "uniform_sentence_length": uniform,
        "sentence_length_mean": round(mean, 1), "sentence_length_variance": round(var, 1),
    }


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    text = extract(Path(sys.argv[1]))
    pars = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    results = []
    for i, p in enumerate(pars, 1):
        r = analyse(p)
        r["paragraph"] = i
        r["preview"] = (p[:90] + "...") if len(p) > 90 else p
        results.append(r)
    judged = [r for r in results if r["rating"] != "too short to judge"]
    counts = {k: sum(1 for r in judged if r["rating"] == k) for k in ("low", "medium", "high")}
    total_words = sum(r["words"] for r in results)
    flagged_words = sum(r["words"] for r in judged if r["rating"] in ("medium", "high"))
    print(json.dumps({
        "file": sys.argv[1], "total_words": total_words, "paragraphs": len(results),
        "paragraphs_judged": len(judged), "rating_counts": counts,
        "share_of_words_in_medium_or_high_paragraphs": round(flagged_words / max(total_words, 1) * 100),
        "caveat": "Style-pattern counts only. Not a probability of AI authorship; thresholds uncalibrated.",
        "details": results,
    }, indent=2))

if __name__ == "__main__":
    main()
