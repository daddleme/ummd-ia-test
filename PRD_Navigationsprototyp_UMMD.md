# PRD: Navigationsprototyp UMMD

## 1. Kontext

Die Universitätsmedizin Magdeburg (UMMD) ist die Dachmarke von Medizinischer Fakultät und Universitätsklinikum Magdeburg. Ihre Website wird neu aufgebaut. Der Prototyp prüft vorab die Navigation, damit sie vor dem Einfrieren der Informationsarchitektur auf Basis von Nutzerfeedback geschärft werden kann.

## 2. Ziele

- **Nutzerziel:** Jede Nutzergruppe findet sich auf der Website wieder und erledigt ihre Aufgaben einfach und intuitiv.
- **Testziel:** Wir prüfen, ob Struktur, Benennungen und Reihenfolge der Navigation verstanden werden und wo Nutzende Inhalte erwarten.
- **Projektziel:** Belastbare Erkenntnisse für die Schärfung der Informationsarchitektur (Labels, Reihenfolge, Ebene 3).

## 3. Zielgruppen und Jobs to be done (Hypothesen)

Die Jobs sind Hypothesen. Die Personas stammen aus der Markenarbeit von Los 1 und nicht aus eigener Nutzerforschung.

| Gruppe | Kern-Job |
|---|---|
| Patientinnen, Patienten, Besuchende | Notfall, Klinik oder Ambulanz finden, Anfahrt und Besuchsinfos |
| Zuweisende Ärztinnen und Ärzte | Zugang und Kontakt für Zuweisung finden |
| Studieninteressierte, Bewerbende | Studienangebote, Bewerbung, Infos für Internationale |
| Studierende | Services, PJ, Skillslab, Studiendekanat, Ansprechpartner |
| Lehrende | Lehrangebote bzw. Weiterbildung, Medizindidaktik |
| Forschende | Schwerpunkte, Studien, Infrastruktur, Kooperationen |
| Bewerbende Karriere | Stellenangebote, Ausbildung, Benefits |
| Öffentlichkeit, Presse | Über die UMMD, Presse und Aktuelles |

Die konkret getesteten Gruppen werden mit der Rekrutierung festgelegt.

## 4. Struktur des Prototyps

**Ebene 1 (immer sichtbar):** Notfall, Suche, Kontakt & Anfahrt, DE/EN

**Ebene 2 (Hauptbereiche):**

1. Behandlung & Aufenthalt
2. Forschung & Innovation
3. Studium & Lehre
4. Karriere & Ausbildung
5. Über die UMMD

**Ebene 3 (Auswahl):**

| Hauptbereich | Unterpunkte |
|---|---|
| Behandlung & Aufenthalt | Kliniken, Medizinische Versorgungszentren, Institute, Ambulanzen, Aufenthalt & Besuch, Für Zuweisende |
| Forschung & Innovation | Forschungsschwerpunkte (Suche Einrichtung), Klinische Studien, Forschungsinfrastruktur, Kooperationen, Nachwuchsförderung |
| Studium & Lehre | Für Studieninteressierte (Studienangebote, Bewerbung), Für Studierende (Service, z. B. Moodle), Für Lehrende (Lehrangebote, Weiterbildung), Studiendekanat (Akademisches Auslandsamt) |
| Karriere & Ausbildung | Stellenangebote, Berufungsverfahren, Ausbildung, Fort- und Weiterbildung, Benefits |
| Über die UMMD | Wer wir sind (Standorte), Leitungsvorstand, Einrichtungen, Kultur und Werte (Qualität und Verantwortung), Presse und Aktuelles |

Labels, Reihenfolge und Ebene 3 sind bewusst noch offen und Gegenstand des Tests.

## 5. Anforderungen an die Navigation

- **Übersichtlich:** Pro Ebene wenige, klar abgegrenzte Punkte.
- **Klar und verständlich:** Benennungen aus Nutzersicht, ohne interne Organisationslogik.
- **Auffindbar für alle Gruppen:** Jede Gruppe erreicht ihre Kernaufgabe in wenigen Klicks.
- **Ohne Doppelungen:** Gleiche Inhalte erscheinen nicht an widersprüchlichen Stellen.
- **Immer erreichbar:** Notfall, Suche, Kontakt & Anfahrt und Sprachwechsel auf jeder Seite.
- **Suche als zweiter Zugangsweg:** Wer nicht über die Navigation findet, kommt über die Suche zum Ziel. Die Suche ersetzt die Navigation nicht, sondern ergänzt sie.

## 6. Prototyp-Umfang

**Enthalten**

- Klickbare Navigation (Ebene 1 bis 3) mit Platzhalterseiten
- Funktionierende Suche mit Suchergebnisseite (Mindestumfang):
  - Suchfeld in Ebene 1, auf jeder Seite erreichbar
  - Eingabe eines Suchbegriffs führt zu einer Ergebnisseite
  - Ergebnisse zeigen Titel, Kurzbeschreibung und Zuordnung (z. B. Bereich oder Seitentyp)
  - Klick auf ein Ergebnis führt zur passenden Platzhalterseite
  - Hinweis, wenn es keine Treffer gibt
- Testaufgaben je Gruppe

**Nicht enthalten**

- Inhalte, visuelles Design, Barrierefreiheit
- Relevanzsteuerung, Autocomplete und Filter in der Suche

**Umsetzungsoptionen für die Suche**

- *Simuliert:* Für eine vorab gesammelte Liste erwartbarer Begriffe und Synonyme (z. B. "Fachschaft", "Bewerbung international", "Notaufnahme") gibt es fertige Ergebnisseiten, alles andere führt zu "keine Treffer". Geeignet für einen Klickprototyp, z. B. in Figma.
- *Frei:* Einfache Stichwortsuche über alle Seitentitel in einem codierten Prototyp (z. B. HTML). Aufwendiger, aber echte Eingabe möglich.

## 7. Offene Punkte aus dem Dekanat-Feedback (gezielt testen)

- Trennung "Für Studieninteressierte" und "Für Studierende": Gibt es Doppelungen?
- Internationale Bewerbungen: direkt auffindbar, nicht nur über Studiendekanat oder Akademisches Auslandsamt?
- "Lehrangebote" unter "Für Lehrende" oder besser "Medizindidaktische Weiterbildung"?
- Fehlende Themen: PJ inkl. Lehrkrankenhäuser, Skillslab, SP-Programm, Fachschaftsrat Medizin.
- Alternative: Übergeordneter Einstieg "Kontakte" (Studiendekanat, AAA, Fachschaft, IMLA).

## 8. Erfolgskriterien

- Hohe Erfolgsquote und wenige Klicks bei den Hauptaufgaben je Gruppe.
- Beobachtung, wo Teilnehmende zuerst klicken (erster Klick).
- Wie viele Teilnehmende nutzen die Suche statt der Navigation, und bei welchen Aufgaben?
- Welche Suchbegriffe werden eingegeben? Das zeigt, welche Benennungen Nutzende erwarten.
- Landen Teilnehmende über die Suche auf der richtigen Seite?
- Qualitative Rückmeldungen zu unklaren Benennungen.

## 9. Testrahmen

- Moderiert, ca. 20 Minuten pro Person, vor Ort in Magdeburg oder online (Teams).
- Teilnehmende dürfen bei den Aufgaben selbst entscheiden, ob sie navigieren oder suchen, und kommentieren laut.
- Aufzeichnung (Audio und Bildschirm) mit schriftlicher Einwilligung.
