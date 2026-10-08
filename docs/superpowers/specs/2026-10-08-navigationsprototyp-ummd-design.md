# Navigationsprototyp UMMD

Stand: 2026-10-08

## Zweck

Klickbarer Prototyp für einen moderierten Usability-Test der Informationsarchitektur der Universitätsmedizin Magdeburg (UMMD). Der Test prüft, ob Benennungen, Reihenfolge und die zwei Navigationsvarianten verstanden werden und wo Teilnehmende Inhalte erwarten.

Der Prototyp bildet Struktur, Position und Beschriftung ab. Er bildet keine fertige Website ab. Gestaltung, Handy-Ansicht und ausgearbeitete Texte bleiben außen vor.

Grundlage ist `PRD_Navigationsprototyp_UMMD.md`. Dieses Dokument legt fest, wo das PRD offen war.

## Entscheidungen

- Eine statische Website, später unter einem öffentlichen Link. Kein Server, keine Anmeldung.
- Zwei Navigationsvarianten in demselben Prototyp. Eine Leiste über der Seite schaltet zwischen Version A und Version B.
- Alle sichtbaren Texte schreiben „und“ aus. Das Zeichen & kommt in der Oberfläche nicht vor.
- Fehlende Themen aus dem Dekanat-Feedback werden auf den passenden Seiten aufgelistet. Sie werden keine zusätzlichen Menüpunkte, außer Moodle, Skillslab und SP-Programm. Diese drei sind eigene Seiten.
- Das Protokoll bleibt im Browser der teilnehmenden Person. „Test beenden“ lädt eine Datei herunter. Es wird nichts übertragen.

## Oberfläche

Drei Schichten, von oben nach unten:

1. **Testleiste.** Schmal, farblich und räumlich von der UMMD-Navigation getrennt. Enthält „Version A“, „Version B“ und „Test beenden“. Die aktive Version ist erkennbar. Ein Wechsel schreibt `?v=a` oder `?v=b` in die Adresse und merkt sich die Wahl im `sessionStorage`. Ein Neuladen behält die Version. Klicks in der Testleiste gelten nicht als Navigationsklicks.
2. **Ebene 1, auf jeder Seite.** Notfall, ein Suchfeld mit der Beschriftung Suche, Kontakt und Anfahrt, DE/EN. Notfall ist der hervorgehobene Eintrag.
3. **Ebene 2.** Behandlung und Aufenthalt, Forschung und Innovation, Studium und Lehre, Karriere und Ausbildung, Über die UMMD.

Das Logo führt auf die Startseite. Die Startseite zeigt den Titel „Universitätsmedizin Magdeburg“ und den Satz „Die Universitätsmedizin Magdeburg verbindet Krankenversorgung, Forschung und Lehre.“ Sie wiederholt die fünf Hauptbereiche nicht als zweite Navigation.

Beim Laden gilt die Version aus der Adresse (`?v=a` oder `?v=b`). Fehlt sie, gilt die zuletzt in `sessionStorage` gemerkte Version. Fehlt auch die, startet Version A. Der Schalter schreibt beides.

Eine unbekannte Adresse zeigt „Diese Seite gibt es im Prototyp nicht“ und einen Link zur Startseite.

### Version A

Ein Klick auf einen Hauptbereich öffnet ein schmales Dropdown direkt unter diesem Punkt. Ein zweiter Klick auf denselben Punkt oder ein Klick auf den Seiteninhalt schließt es. Es öffnet per Klick, nicht beim Darüberfahren. Liegt der Punkt weit rechts, öffnet das Dropdown nach links, sodass es im Fenster bleibt.

Das Dropdown enthält nur die dritte Ebene:

| Hauptbereich | Einträge |
|---|---|
| Behandlung und Aufenthalt | Kliniken, Medizinische Versorgungszentren, Institute, Ambulanzen, Aufenthalt und Besuch, Für Zuweisende |
| Forschung und Innovation | Forschungsschwerpunkte, Klinische Studien, Forschungsinfrastruktur, Kooperationen, Nachwuchsförderung |
| Studium und Lehre | Für Studieninteressierte, Für Studierende, Für Lehrende, Studiendekanat |
| Karriere und Ausbildung | Stellenangebote, Berufungsverfahren, Ausbildung, Fort- und Weiterbildung, Benefits |
| Über die UMMD | Wer wir sind, Leitungsvorstand, Einrichtungen, Kultur und Werte, Presse und Aktuelles |

Ein Klick auf einen Eintrag öffnet dessen Seite. Die Menüzeile bleibt unverändert. Es gibt keine Seitennavigation.

Vier dieser Seiten führen über Kacheln weiter:

| Seite in Version A | Kacheln |
|---|---|
| Für Studieninteressierte | Studienangebote, Bewerbung |
| Für Studierende | Moodle, Skillslab, SP-Programm |
| Für Lehrende | Lehrangebote, Weiterbildung |
| Studiendekanat | Akademisches Auslandsamt |

### Version B

Ein Klick auf einen Hauptbereich öffnet eine Leiste direkt unter der Menüzeile. Sie beginnt links am Menü und ist nur so breit wie ihre Spalten. Würde sie rechts aus dem Fenster laufen, rückt sie nach links, bis sie vollständig sichtbar ist. Ein zweiter Klick auf denselben Hauptbereich oder ein Klick auf den Seiteninhalt schließt sie.

Die graue Spaltenüberschrift ist kein Link. Die unterstrichenen Einträge sind Links und führen direkt auf die Seite. Keine Spalte enthält nur einen Link.

| Hauptbereich | Spalte | Links |
|---|---|---|
| Behandlung und Aufenthalt | Behandlung finden | Kliniken, Medizinische Versorgungszentren, Institute, Ambulanzen |
| Behandlung und Aufenthalt | Aufenthalt und Zuweisung | Aufenthalt und Besuch, Für Zuweisende |
| Forschung und Innovation | Themen | Forschungsschwerpunkte, Klinische Studien |
| Forschung und Innovation | Zusammenarbeit | Forschungsinfrastruktur, Kooperationen, Nachwuchsförderung |
| Studium und Lehre | Für Studieninteressierte | Studienangebote, Bewerbung |
| Studium und Lehre | Für Studierende | Moodle, Skillslab, SP-Programm |
| Studium und Lehre | Für Lehrende | Lehrangebote, Weiterbildung |
| Studium und Lehre | Anlaufstellen | Studiendekanat, Akademisches Auslandsamt |
| Karriere und Ausbildung | Offene Stellen | Stellenangebote, Berufungsverfahren |
| Karriere und Ausbildung | Ausbildung und Arbeiten | Ausbildung, Fort- und Weiterbildung, Benefits |
| Über die UMMD | Porträt | Wer wir sind, Kultur und Werte, Presse und Aktuelles |
| Über die UMMD | Leitung und Einrichtungen | Leitungsvorstand, Einrichtungen |

In Version B gibt es die vier Kachelseiten aus Version A nicht im Menü. Ihre Adressen leiten auf die Startseite um.

## Seiteninhalt

Jede Inhaltsseite zeigt die Überschrift, identisch mit dem Menünamen, den Satz und die Liste „Auf dieser Seite“ aus der Tabelle. Kachelseiten in Version A zeigen die Kacheln über der Liste. Die deutschen Texte sind die Quelle. Die englischen Texte in der Inhaltsdatei sind ihre direkte Übersetzung.

| Seite | Satz | Auf dieser Seite |
|---|---|---|
| Notfall | Hilfe bei einem medizinischen Notfall auf dem Campus. | Notaufnahme, Notruf, Weg zur Notaufnahme |
| Kontakt und Anfahrt | So erreichen Sie die UMMD. | Adresse, Anfahrt, Parken, Kontakt |
| Kliniken | Die Kliniken der UMMD im Überblick. | Klinikübersicht, Ansprechpartner, Sprechstunden |
| Medizinische Versorgungszentren | Versorgung außerhalb der Kliniken. | Standorte der Zentren, Angebote, Kontakt |
| Institute | Die Institute der Medizinischen Fakultät. | Institutsübersicht, Forschung an den Instituten, Kontakt |
| Ambulanzen | Ambulante Behandlung an der UMMD. | Ambulanzübersicht, Sprechstunden, Anmeldung |
| Aufenthalt und Besuch | Informationen für den Aufenthalt und für Besuche. | Besuchszeiten, Übernachtung, Service vor Ort |
| Für Zuweisende | Zugang für zuweisende Ärztinnen und Ärzte. | Zuweisung, Einweisung, Kontakt |
| Forschungsschwerpunkte | Die wissenschaftlichen Schwerpunkte der UMMD. | Schwerpunkte, Suche Einrichtung, beteiligte Kliniken |
| Klinische Studien | Studien, an denen die UMMD beteiligt ist. | Laufende Studien, Teilnahme, Kontakt |
| Forschungsinfrastruktur | Geräte und Einrichtungen für die Forschung. | Zentrale Forschungsplattformen, Großgeräte, Nutzung |
| Kooperationen | Partner in Forschung und Versorgung. | Verbünde, Partner, Ansprechpartner |
| Nachwuchsförderung | Wege in die wissenschaftliche Karriere. | Promotion, Programme, Beratung |
| Für Studieninteressierte | Einstieg für Menschen, die an der UMMD studieren wollen. | Studienangebote, Bewerbung |
| Für Studierende | Einstieg für eingeschriebene Studierende. | Moodle, Skillslab, SP-Programm, PJ, Fachschaftsrat |
| Für Lehrende | Einstieg für Lehrende der UMMD. | Lehrangebote, Weiterbildung |
| Studiendekanat | Anlaufstelle für Studium und Lehre. | Ansprechpartner, Akademisches Auslandsamt |
| Studienangebote | Welche Studiengänge die UMMD anbietet. | Studiengänge, Abschlüsse, Voraussetzungen |
| Bewerbung | So bewerben Sie sich um einen Studienplatz. | Fristen, Voraussetzungen, Bewerbung international |
| Moodle | Die Lernplattform für Studierende. | Zugang, Kurse, PJ, Fachschaftsrat |
| Skillslab | Üben praktischer Fertigkeiten. | Kurse, Räume, PJ, Fachschaftsrat |
| SP-Programm | Das Studienprogramm SP. | Aufbau, Anmeldung, PJ, Fachschaftsrat |
| Lehrangebote | Lehre an der UMMD für Dozierende. | Lehrveranstaltungen, Materialien, Ansprechpartner |
| Weiterbildung | Weiterbildung für Lehrende. | Medizindidaktik, Kurse, Anmeldung |
| Akademisches Auslandsamt | Studium mit internationalem Bezug. | Auslandsaufenthalt, Studierende aus dem Ausland, Bewerbung international |
| Stellenangebote | Offene Stellen an der UMMD. | Aktuelle Stellen, Bewerbung auf eine Stelle, Kontakt |
| Berufungsverfahren | Verfahren für Professuren. | Laufende Verfahren, Ablauf, Kontakt |
| Ausbildung | Ausbildung an der UMMD. | Berufe, freie Plätze, Bewerbung |
| Fort- und Weiterbildung | Fortbildung für Beschäftigte. | Programm, Anmeldung, Zertifikate |
| Benefits | Was die UMMD als Arbeitgeberin bietet. | Arbeitsbedingungen, Familie, Entwicklung |
| Wer wir sind | Auftrag und Aufbau der UMMD. | Krankenversorgung, Forschung, Lehre, Standorte |
| Leitungsvorstand | Die Leitung der UMMD. | Mitglieder, Aufgaben, Kontakt |
| Einrichtungen | Einrichtungen unter dem Dach der UMMD. | Fakultät, Klinikum, weitere Einrichtungen |
| Kultur und Werte | Wofür die UMMD steht. | Leitbild, Zusammenarbeit, Qualität und Verantwortung |
| Presse und Aktuelles | Neuigkeiten und Pressekontakt. | Meldungen, Pressekontakt, Bildmaterial |

Die vier Kachelseiten zeigen dieselben Texte. In Version A stehen die Kacheln über der Liste.

DE/EN schaltet Navigationsbezeichnungen, Seitentitel, den einen Satz und die Liste „Auf dieser Seite“. Die Struktur bleibt gleich. In beiden Sprachen wird „und“ beziehungsweise „and“ ausgeschrieben.

## Suche

Das Suchfeld ist auf jeder Seite sichtbar. Absenden mit Enter oder mit dem Knopf „Suchen“ öffnet die Ergebnisseite. Eine Eingabe mit weniger als zwei Zeichen bleibt auf der Seite.

Durchsucht werden Seitentitel, der eine Satz und die Liste „Auf dieser Seite“. Ein Treffer liegt vor, wenn die Eingabe, unabhängig von Groß- und Kleinschreibung, in einem dieser Texte vorkommt. Die Synonymliste ergänzt Treffer, auch wenn das Wort auf der Seite nicht steht. Es gibt keine Gewichtung, keine Vorschläge während der Eingabe und keine Filter. Die Trefferliste folgt der Reihenfolge der Hauptbereiche und darin der Reihenfolge in der Inhaltsdatei.

Die Startliste der Synonyme:

| Eingabe | Seite |
|---|---|
| Notaufnahme, Notruf | Notfall |
| Fachschaft, Fachschaftsrat | Moodle |
| PJ, Praktisches Jahr | Moodle |
| international, Ausland | Bewerbung |
| Anfahrt, Parken, Adresse | Kontakt und Anfahrt |
| Zuweisung, Einweisung | Für Zuweisende |
| Jobs, Stellen | Stellenangebote |

Ein Ergebnis zeigt Titel, den einen Satz und den Hauptbereich. Ein Klick öffnet die Seite. Die Ergebnisseite merkt sich den eingegebenen Begriff.

Kein Treffer zeigt „Keine Treffer für …“ und das Suchfeld, bereits mit dem Begriff gefüllt.

Die Kachelseiten aus Version A tauchen in den Ergebnissen nur auf, wenn Version A aktiv ist.

## Protokoll und Moderation

Der Prototyp speichert das Protokoll in `localStorage` auf dem Gerät der teilnehmenden Person.

Jeder Eintrag enthält Zeitpunkt, Art, Version und die Aufgabenmarke, die zu diesem Zeitpunkt gilt. Arten:

- **Seitenaufruf:** Adresse, Titel, Herkunft (Menü, Kachel, Suche, Logo, direkte Adresse)
- **Suche:** eingegebener Begriff, Anzahl der Treffer
- **Aufgabenmarke:** Teilnehmerkennung, Nutzergruppe, Aufgabenname
- **Versionswechsel:** von welcher Version zu welcher

Der erste Navigationsklick einer Aufgabe ist der erste Seitenaufruf nach einer Aufgabenmarke, dessen Herkunft Menü, Kachel oder Suche ist. Die Dauer einer Aufgabe ist die Zeit bis zur nächsten Aufgabenmarke oder bis „Test beenden“. Beides lässt sich aus dem Protokoll ableiten. Der Prototyp rechnet es nicht vor.

`Shift+M` öffnet die Moderationsansicht und schließt sie wieder. Sie liegt über der Seite und ist nur sichtbar, solange sie geöffnet ist. Felder: Teilnehmerkennung, Nutzergruppe, Aufgabenname, alle als freier Text. „Marke setzen“ schreibt eine Aufgabenmarke. Die Feldwerte bleiben in `sessionStorage` erhalten, bis sie geändert werden.

„Test beenden“ in der Testleiste lädt eine JSON-Datei herunter. Der Dateiname ist `ummd-protokoll-<Teilnehmerkennung oder "unbenannt">-<Datum>.json`. Die Datei enthält die Einträge und die Teilnehmerkennung, auch wenn noch keine Marke gesetzt wurde. Danach bleibt das Protokoll im Browser erhalten, damit ein erneuter Download möglich ist.

## Technik

Eine Inhaltsdatei beschreibt Hauptbereiche, beide Menüvarianten, Seiten, Sätze, Listen und Synonyme auf Deutsch und Englisch. Die Navigation wird daraus gezeichnet. Eine Textänderung braucht keine Änderung am Seitenaufbau.

Seitenwechsel laufen über die Adresse, damit Neuladen und Zurück funktionieren. Es gibt keinen Build-Schritt: HTML, CSS und eine Skriptdatei genügen, damit die Seite als statische Datei und später über GitHub Pages oder Netlify erreichbar ist.

Die Handy-Ansicht ist nicht Teil dieses Prototyps. Das Fenster wird so breit vorausgesetzt, dass Ebene 2 in einer Zeile steht.

## Prüfung vor dem Test

Vor dem Einsatz einmal von Hand durchgehen:

- Version A: jeder Dropdown-Eintrag öffnet die richtige Seite, jede Kachel öffnet die Unterseite, die Menüzeile bleibt stehen.
- Version B: jede Spalte entspricht der Tabelle oben, Überschriften sind nicht klickbar, kein Weg führt auf eine Kachelseite.
- Ebene 1 ist auf einer Unterseite, einer Ergebnisseite und der Startseite erreichbar.
- Suche findet „Fachschaft“, „Notaufnahme“ und „Bewerbung“. Eine unsinnige Eingabe zeigt den Hinweis ohne Treffer.
- DE/EN schaltet die sichtbaren Texte. Ein & ist nirgends sichtbar.
- Versionswechsel übersteht ein Neuladen.
- `Shift+M` setzt eine Marke. „Test beenden“ lädt eine Datei mit Seitenaufruf, Suchbegriff und Marke. In den Netzwerkanfragen des Browsers geht dabei nichts hinaus.
