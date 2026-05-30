# Cultural Glossary

Reference document for all cultural and linguistic terms used in 3sheerti. Code comments referencing these terms should link back to this file.

This glossary is not exhaustive — it covers terms that appear in the codebase, UI strings, and product documentation. For deeper cultural context, consult community elders.

---

## Chechen Terms (Primary Phase 1)

### Teip (тайп · تايب)
The fundamental unit of Chechen social organization — a clan, sub-tribe, or extended kinship group sharing a common (often legendary) ancestor. There are approximately 150 teips in Chechen society. Membership is patrilineal. Each teip historically had its own elders, customs, and origin aul. In 3sheerti the teip is the top-level grouping that contains all family names within it.

### Family Name (Сурт · اسم العائلة)
A patrilineal family lineage **within** a teip. Multiple distinct families may exist within the same teip, each with their own founding ancestor. In 3sheerti, every Person belongs to exactly one Family Name, which belongs to exactly one Teip.

### Aul (эвла · قرية)
An ancestral village in the Caucasus. Each Chechen family historically traces back to a specific aul. Examples: Vedeno, Shatoi, Argun, Urus-Martan, Itum-Kale. In 3sheerti, each Person can pin their family's origin aul on a map; this powers the "Aul View" — discovering others whose families came from the same village.

### Nokhchi (нохчий · شيشاني)
The Chechen people's self-name. Singular: Nokhcho. The plural form is used in modern Chechen identity contexts.

### Nokhchalla (нохчалла)
The Chechen code of honor — a moral and behavioral framework covering hospitality, dignity, respect for elders, courage, restraint, and obligation to family and community. Roughly analogous to a worldview rather than a written code. Referenced for cultural context throughout the application but not enforced in code.

### Vird (вирд)
A Sufi spiritual brotherhood or order. Most Chechens belong to either the **Qadiri** order (often associated with the Kunta-Haji branch) or the **Naqshbandi** order. Vird affiliation is part of religious identity and family heritage. In 3sheerti, vird is an **optional** profile field with strict privacy defaults.

### Aardakh (Ардах)
"The Exile" — the 1944 forced deportation of the entire Chechen and Ingush peoples by Stalin to Central Asia (primarily Kazakhstan), where hundreds of thousands died. Commemorated on **February 23** each year. A foundational event in modern Chechen diaspora identity. The 3sheerti application will surface commemorations and elder stories around this date.

### Daimokhk (Даймохк)
"The Fatherland" — the Chechen homeland. Used in cultural and emotional context for the Caucasus region. In 3sheerti, "homeland" features (origin maps, virtual aul tours, news filters) center on Daimokhk.

### Kunta-Haji
A 19th-century Sufi master and key figure in Chechen religious history; founder of the Kunta-Haji branch of the Qadiri vird. His descendants and followers form a significant religious lineage today.

### Imam Shamil
19th-century Avar leader of the Caucasian resistance to the Russian Empire (1834–1859). A revered historical figure across Chechen, Ingush, Avar, and other North Caucasian peoples.

### Sheikh Mansur
Late 18th-century Chechen religious leader who led the first major resistance to Russian expansion (1785–1791). Considered the spiritual ancestor of Caucasian Islamic resistance.

---

## Circassian / Adyghe Terms (Phase 3 — for future reference)

### Adyghe (Адыгэ)
The self-name of the Circassian people. The Adyghe are organized into twelve historical tribes.

### Adyghe Khabze
The traditional Circassian code of conduct — analogous to Chechen Nokhchalla, governing hospitality, respect, family obligation, and social behavior.

### Twelve Tribes
The historical Circassian tribes: Abadzekh, Bzhedug, Chemguy (Temirgoy), Hatuqwai, Kabardian, Mamkhegh, Natukhai, Shapsug, Ubykh, Yegeruqai, Zhaneev, Besleney. Some are diaspora-only today; others survive in the North Caucasus republics of Adygea, Kabardino-Balkaria, and Karachay-Cherkessia.

### May 21
**Circassian Day of Mourning** — commemorates the 1864 Russian expulsion of the Circassian people from their Caucasian homeland, which scattered survivors across the Ottoman Empire. Equivalent in significance to the Chechen Aardakh.

---

## Arabic / Islamic Terms (used in UI and documentation)

### Nasab (نسب)
Arabic genealogical lineage — the practice of identifying oneself through a chain of male ancestors (X son of Y son of Z son of family name). The lineage walk-up onboarding in 3sheerti mirrors this practice.

### Kunya (كنية)
An honorific name based on a person's child or characteristic — "Abu [son's name]" (father of), "Umm [son's name]" (mother of). Common across Arab and Caucasian Muslim cultures. In 3sheerti, kunya is an optional alternative-name field on the Person record.

### Hijri (هجري)
The Islamic lunar calendar. 3sheerti displays both Hijri and Gregorian dates throughout the application (commemorations, profile dates, event scheduling).

### Mahram (محرم)
Family members with whom marriage would be religiously prohibited — close blood relatives, in-laws, and milk relatives. Used in modesty/privacy contexts: certain profile fields may be made visible to mahram relatives only.

### Sadaqa Jariya (صدقة جارية)
"Continuous charity" — an act of charity whose benefit continues after death (planting a tree, building a well, contributing knowledge). Relevant context for elder voice-bank, oral history preservation, and memorial donation features.

### Sandooq al-A'ila (صندوق العائلة)
"Family fund" — informal pooled financial support within a family or tribe. A potential Phase 2 feature for codified mutual aid.

---

## Geographic References

### Sweileh (سويلح)
A neighborhood in Amman, Jordan, with a historically large Chechen community. One of the primary launch communities for Phase 1.

### Zarqa (الزرقاء)
Jordanian governorate and city. Significant Chechen population.

### Vedeno, Shatoi, Argun, Urus-Martan, Itum-Kale
Examples of Chechen auls (villages) commonly cited as ancestral origins for diaspora families.

### Khasavyurt, Grozny
Cities in or near Chechnya with historical and modern significance.

### Reyhaniyya, Kfar Kama
Chechen and Circassian villages in present-day Israel/Palestine, established by 19th-century diaspora.

---

## Notes for Agents

- These terms appear in the **codebase as proper nouns** — do not translate them in code, comments, or UI strings. They appear as-is across all locales.
- When introducing one of these terms in code for the first time in a file, add a brief comment with a reference: `// teip = Chechen clan unit, see docs/CULTURAL_GLOSSARY.md`
- If you encounter a cultural term not in this glossary while working on a task, **do not guess its meaning**. Add a `TODO(human):` comment and a question in `docs/QUESTIONS.md`.
- This glossary will grow over time as more Caucasian peoples join the platform. Updates should be made by humans, not agents.
