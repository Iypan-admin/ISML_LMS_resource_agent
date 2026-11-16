// =============================================================================
// ISML THEMATIC CURRICULUM RESOLVER
// Master pedagogical kit resolver for German, French, Spanish, Japanese, Korean, English
// Solves:
// 1. Elimination of random URL tokens/hashes (Tfch, Zgxodmx, Aebxcjf, Bdz)
// 2. Pure authentic native vocabulary grounded in the lesson's actual topic
// 3. Topic-specific, target-language dialogues (ZERO formulaic "Alex" templates)
// 4. Non-repeating LSRW drills tailored to the grammatical/thematic objective
// 5. Academic CEFR A1 scaffolding (e.g., Präteritum scoped to war/hatte, Prepositions scoped to A1)
// =============================================================================

export interface ThematicWordItem {
  word: string;
  meaning: string;
  pronunciation: string;
  example_sentence: string;
}

export interface ThematicDrillItem {
  question: string;
  answer: string;
  explanation: string;
}

export interface ThematicPedagogicalKit {
  thematicKey: string;
  topicTitle: string;
  grammarFocus: string;
  pedagogicalObjective: string;
  cefrLevel: string;
  cefrScaffoldingNote?: string;
  vocabulary: ThematicWordItem[];
  dialogue: string[];
  drills: ThematicDrillItem[];
  homework: string[];
  boardNotes: string;
}

// =============================================================================
// GERMAN THEMATIC DICTIONARY (21 Comprehensive A1 Domains)
// =============================================================================
const GERMAN_THEMATIC_BANK: Record<string, ThematicPedagogicalKit> = {
  numbers: {
    thematicKey: "numbers",
    topicTitle: "Zahlen von 0 bis 100, Mengen und Telefonnummern",
    grammarFocus: "Kardinalzahlen (0-100), Zahlenbildung (Inversion bei zweistelligen Zahlen: einundzwanzig) und Mengenangaben",
    pedagogicalObjective: "Zahlen sicher verstehen und aussprechen, Preise erfragen und Telefonnummern korrekt angeben.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "eins, zwei, drei", meaning: "Foundational cardinal numbers 1, 2, 3", pronunciation: "/aɪ̯ns, tsvaɪ̯, dʁaɪ̯/", example_sentence: "Eins, zwei, drei: Wir zählen die neuen Wörter." },
      { word: "zehn, zwanzig, hundert", meaning: "Cardinal milestones: 10, 20, 100", pronunciation: "/tseːn, ˈtsvantsɪç, ˈhʊndɐt/", example_sentence: "Das Buch kostet zwanzig Euro und zehn Cent." },
      { word: "die Telefonnummer", meaning: "Telephone contact number", pronunciation: "/teleˈfoːnˌnʊmɐ/", example_sentence: "Wie ist deine Telefonnummer? – Meine Nummer ist 0176 452891." },
      { word: "kosten", meaning: "To cost (pricing inquiry verb)", pronunciation: "/ˈkɔstn̩/", example_sentence: "Wie viel kostet ein Kaffee mit Milch? – Er kostet drei Euro." }
    ],
    dialogue: [
      "Kassierer: 'Guten Tag! Das macht zusammen achtzehn Euro fünfzig, bitte.'",
      "Kunde: 'Guten Tag! Hier sind zwanzig Euro.'",
      "Kassierer: 'Vielen Dank. Und ein Euro fünfzig zurück. Brauchen Sie den Beleg?'",
      "Kunde: 'Nein danke, das stimmt so. Einen schönen Tag noch!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Der Verkäufer sagt: 'Das Ticket kostet 34 Euro.' Welche Zahl haben Sie gehört?", answer: "vierunddreißig (34)", explanation: "Im Deutschen nennt man bei zweistelligen Zahlen zuerst die Einerstelle, dann 'und', dann die Zehnerstelle." },
      { question: "🗣️ [Sprechen] Zählen Sie flüssig von 1 bis 12 auf Deutsch und nennen Sie Ihre Postleitzahl.", answer: "eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn, elf, zwölf.", explanation: "Trainiert die Mundmotorik und Zahlenautomatismen im Alltag." },
      { question: "📖 [Lesen & Syntax] Bilden Sie die Zahl 47 in Worten: (sieben + und + vierzig).", answer: "siebenundvierzig", explanation: "Regelmäßige Zusammenschreibung zweistelliger Zahlen ohne Bindestrich." },
      { question: "✍️ [Schreiben] Schreiben Sie einen kurzen Mini-Dialog (2 Sätze) an der Kasse mit Preisen.", answer: "– 'Wie viel kostet das Brot?' – 'Es kostet zwei Euro vierzig.'", explanation: "Festigt alltägliche Transaktionsformulierungen." }
    ],
    homework: [
      "Schreiben Sie die Zahlen von 1 bis 30 in Ihr Heft und markieren Sie 'elf' und 'zwölf'.",
      "Üben Sie Ihre eigene Telefonnummer auf Deutsch laut auszusprechen."
    ],
    boardNotes: "Zahlen 0-100:\n• 1-12: unregelmäßig (eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn, elf, zwölf)\n• 13-19: Zahl + zehn (dreizehn, vierzehn... aber: sechzehn, siebzehn!)\n• 20-90: Einer + und + Zehner (einundzwanzig, zweiunddreißig...)"
  },

  vocabulary: {
    thematicKey: "vocabulary",
    topicTitle: "A1-Grundwortschatz: Gegenstände, Alltag und Lernstrategien",
    grammarFocus: "Substantive und Artikelzuordnung (der/die/das), Nomen werden im Deutschen immer großgeschrieben",
    pedagogicalObjective: "Den wesentlichen Alltagswortschatz für Gegenstände und Klassenraumaktivitäten sicher anwenden.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "das Wort", meaning: "Word (lexical linguistic unit)", pronunciation: "/vɔʁt/", example_sentence: "Wir lernen heute zehn neue Wörter auf Deutsch." },
      { word: "der Gegenstand", meaning: "Everyday object / classroom item", pronunciation: "/ˈɡeːɡn̩ʃtant/", example_sentence: "Auf dem Schreibtisch liegt ein nützlicher Gegenstand." },
      { word: "das Wörterbuch", meaning: "Dictionary / lexical reference", pronunciation: "/ˈvœʁtɐˌbuːx/", example_sentence: "Im Wörterbuch schlage ich die genaue Bedeutung nach." },
      { word: "bedeuten", meaning: "To mean / signify", pronunciation: "/bəˈdɔɪ̯tn̩/", example_sentence: "Was bedeutet dieser Ausdruck auf Englisch?" }
    ],
    dialogue: [
      "Lukas: 'Entschuldigung, Frau Weber! Was bedeutet das Wort Schreibtisch?'",
      "Frau Weber: 'Ein Schreibtisch ist ein Tisch, an dem man lernt oder arbeitet. Der Artikel ist der: der Schreibtisch.'",
      "Lukas: 'Danke schön! Schreibt man Nomen im Deutschen immer groß?'",
      "Frau Weber: 'Ganz genau, Lukas! Jedes Substantiv beginnt immer mit einem Großbuchstaben.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Hören Sie den Satz: 'Schlagen Sie bitte das Wörterbuch auf!' Welche Handlung wird gefordert?", answer: "Das Wörterbuch öffnen und nachschlagen.", explanation: "Erkennt Anweisungen im Unterrichtskontext." },
      { question: "🗣️ [Sprechen] Sprechen Sie die drei grammatikalischen Artikel laut aus: 'der, die, das'.", answer: "der (Maskulinum), die (Femininum), das (Neutrum).", explanation: "Automatisiert die Dreiteilung des deutschen Genussystems." },
      { question: "📖 [Lesen & Syntax] Welches Wort ist orthografisch korrekt geschrieben: 'buch', 'Buch' oder 'bUch'?", answer: "Buch", explanation: "Im Deutschen werden alle Substantive zwingend großgeschrieben." },
      { question: "✍️ [Schreiben] Notieren Sie drei Gegenstände aus Ihrem Zimmer mit Artikel (z.B. der Stuhl, die Lampe, das Bett).", answer: "der Stuhl, die Lampe, das Bett.", explanation: "Verbindet Nomen unmittelbar mit ihrem grammatischen Geschlecht." }
    ],
    homework: [
      "Erstellen Sie eine Vokabelliste mit 10 Dingen aus Ihrer Wohnung inklusive Artikel und Plural.",
      "Lernen Sie die Artikel mit Farbcodes: Blau für der, Rot für die, Grün für das."
    ],
    boardNotes: "Wortschatz-Regeln:\n• Jedes deutsche Nomen hat ein Geschlecht: der (m), die (f), das (n)\n• Nomen werden IMMER großgeschrieben (das Buch, der Tisch, die Schule)\n• Immer das Nomen zusammen mit dem Artikel lernen!"
  },

  greetings: {
    thematicKey: "greetings",
    topicTitle: "Begrüßung, Verabschiedung und Höflichkeitsformen (du vs. Sie)",
    grammarFocus: "Formelle Höflichkeitsform 'Sie' versus informelles 'du', Begrüßungsformeln nach Tageszeit",
    pedagogicalObjective: "Zwischen formeller und informeller Anrede unterscheiden und passende Begrüßungen wählen.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "Guten Tag / Hallo", meaning: "Formal daytime greeting / Casual greeting", pronunciation: "/ˈɡuːtn̩ ˈtaːk / ˈhaloː/", example_sentence: "Guten Tag, Herr Müller! Hallo Anna!" },
      { word: "Wie geht es Ihnen?", meaning: "How are you? (Formal register addressing a teacher or elder)", pronunciation: "/viː ɡeːt ɛs ˈiːnən/", example_sentence: "Guten Morgen Frau Braun, wie geht es Ihnen heute?" },
      { word: "Auf Wiedersehen / Tschüss", meaning: "Formal farewell / Casual goodbye", pronunciation: "/aʊ̯f ˈviːdɐˌzeːən / t͡ʃʏs/", example_sentence: "Auf Wiedersehen, bis morgen im Sprachkurs!" },
      { word: "Freut mich", meaning: "Pleased to meet you", pronunciation: "/fʁɔɪ̯t mɪç/", example_sentence: "Ich bin Thomas Weber. – Freut mich sehr!" }
    ],
    dialogue: [
      "Herr Schmidt: 'Guten Tag, Frau Meyer! Wie geht es Ihnen heute?'",
      "Frau Meyer: 'Guten Tag, Herr Schmidt! Mir geht es sehr gut, danke. Und wie geht es Ihnen?'",
      "Herr Schmidt: 'Ausgezeichnet, vielen Dank! Darf ich Ihnen meinen Kollegen vorstellen? Das ist Herr Lang.'",
      "Frau Meyer: 'Guten Tag, Herr Lang! Sehr angenehm, Sie kennenzulernen.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Wann verwendet man 'Auf Wiedersehen' und wann 'Tschüss'?", answer: "'Auf Wiedersehen' ist formell (Geschäft, Lehrer, Fremde); 'Tschüss' ist informell (Freunde, Familie).", explanation: "Pragmatische Unterscheidung der Register im deutschen Sprachraum." },
      { question: "🗣️ [Sprechen] Begrüßen Sie Ihren Lehrer formell am Vormittag.", answer: "'Guten Morgen, Herr/Frau [Nachname]! Wie geht es Ihnen?'", explanation: "Korrekte Wahl der Höflichkeitsform 'Sie' und 'Ihnen'." },
      { question: "📖 [Lesen & Syntax] Ergänzen Sie die passende Form: 'Hallo Paul, wie geht es _____? (dir / Ihnen)'", answer: "dir", explanation: "Paul wird geduzt, daher Dativ Singular informell: 'dir'." },
      { question: "✍️ [Schreiben] Schreiben Sie eine kurze Begrüßung für eine E-Mail an Ihren Deutschdozenten.", answer: "Sehr geehrte/r Frau/Herr [Name], ich wünsche Ihnen einen guten Tag.", explanation: "Erste Schritte in der formellen schriftlichen Korrespondenz." }
    ],
    homework: [
      "Kombinieren Sie 5 Tageszeiten mit den passenden Begrüßungen (Morgen, Tag, Abend, Nacht).",
      "Schreiben Sie einen 4-zeiligen Begrüßungsdialog zwischen zwei Studienkollegen."
    ],
    boardNotes: "Begrüßungsregister:\n• Formell: Guten Morgen / Guten Tag / Guten Abend | Wie geht es Ihnen? | Auf Wiedersehen\n• Informell: Hallo / Hi | Wie geht's dir? | Tschüss / Bis bald"
  },

  verben_konjugation: {
    thematicKey: "verben_konjugation",
    topicTitle: "Verben im Präsens: Regelmäßige und unregelmäßige Konjugation",
    grammarFocus: "Personalendungen im Präsens (-e, -st, -t, -en, -t, -en) und Vokalwechsel bei starken Verben (e -> i/ie, a -> ä)",
    pedagogicalObjective: "Regelmäßige und wichtige unregelmäßige Verben im Präsens für alle Personen fehlerfrei konjugieren.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "wohnen, kommen, heißen", meaning: "Regular foundation verbs: to live, to come from, to be called", pronunciation: "/ˈvoːnən, ˈkɔmən, ˈhaɪ̯sn̩/", example_sentence: "Ich wohne in Berlin und komme aus Spanien." },
      { word: "sprechen (spricht)", meaning: "To speak (stem-vowel change e -> i)", pronunciation: "/ˈʃpʁɛçn̩ (ʃpʁɪçt)/", example_sentence: "Er spricht sehr gut Deutsch und etwas Französisch." },
      { word: "lesen (liest)", meaning: "To read (stem-vowel change e -> ie)", pronunciation: "/ˈleːzn̩ (liːst)/", example_sentence: "Liest du gern deutsche Kurzgeschichten?" },
      { word: "sein / haben", meaning: "Auxiliary root verbs: to be / to have", pronunciation: "/zaɪ̯n / ˈhaːbn̩/", example_sentence: "Wir sind im Unterricht und haben viele Fragen." }
    ],
    dialogue: [
      "Elena: 'Hallo David! Woher kommst du und welche Sprachen sprichst du?'",
      "David: 'Hallo Elena! Ich komme aus Italien, aber ich wohne jetzt in Hamburg. Ich spreche Italienisch und lerne Deutsch.'",
      "Elena: 'Toll! Liest du auch schon deutsche Zeitungen?'",
      "David: 'Ja, ich lese jeden Tag einfache Artikel und mein Tandempartner hilft mir dabei.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Welches Subjekt passt zur Verbform 'sprichst'?", answer: "'du' (du sprichst)", explanation: "Endung -st mit Vokalwechsel e -> i markiert die 2. Person Singular." },
      { question: "🗣️ [Sprechen] Konjugieren Sie das Verb 'wohnen' für alle 6 Personalpronomen laut durch.", answer: "ich wohne, du wohnst, er/sie/es wohnt, wir wohnen, ihr wohnt, sie/Sie wohnen.", explanation: "Festigt das Standard-Konjugationsmuster regelmäßiger Verben." },
      { question: "📖 [Lesen & Syntax] Korrigieren Sie den Fehler: 'Er spreche sehr schnell.'", answer: "Er spricht sehr schnell.", explanation: "3. Person Singular von 'sprechen' verlangt den Vokalwechsel e -> i und die Endung -t." },
      { question: "✍️ [Schreiben] Bilden Sie 3 vollständige Sätze mit den Verben: kommen, wohnen, lernen.", answer: "Ich komme aus Deutschland. Du wohnst in Frankfurt. Wir lernen fleißig.", explanation: "Präsens-Satzbau mit Verb an Position 2." }
    ],
    homework: [
      "Konjugieren Sie die Verben 'arbeiten', 'fahren' und 'sehen' im Heft.",
      "Schreiben Sie einen kurzen Steckbrief über sich selbst mit mindestens 4 Verben."
    ],
    boardNotes: "Präsens-Personalendungen:\nich -e | du -(s)t | er/sie/es -t | wir -en | ihr -t | sie/Sie -en\nVokalwechsel bei du & er/sie/es:\n• e -> i: sprechen -> du sprichst, er spricht\n• e -> ie: lesen -> du liest, er liest\n• a -> ä: fahren -> du fährst, er fährt"
  },

  ordinal_numbers: {
    thematicKey: "ordinal_numbers",
    topicTitle: "Ordinalzahlen, Datumsangaben und Reihenfolgen",
    grammarFocus: "Bildung der Ordinalzahlen (1-19: Stamm + -te; ab 20: Stamm + -ste) und Datumsausdrücke mit 'am ...-ten'",
    pedagogicalObjective: "Datumsangaben formulieren, Geburtstage nennen und chronologische Rangfolgen beschreiben.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "der erste / die erste", meaning: "The first (ordinal number 1st)", pronunciation: "/deːɐ̯ ˈeːɐ̯stə/", example_sentence: "Heute ist der erste Schultag im neuen Semester." },
      { word: "der dritte / der siebte", meaning: "The third / the seventh (irregular stem ordinals)", pronunciation: "/deːɐ̯ ˈdʁɪtə / ˈziːptə/", example_sentence: "Der dritte Mai ist ein Feiertag." },
      { word: "am ersten / am zwanzigsten", meaning: "On the first / on the twentieth (dated temporal phrases with Dative)", pronunciation: "/am ˈeːɐ̯stn̩ / ˈtsvantsɪçstn̩/", example_sentence: "Mein Geburtstag ist am zwanzigsten Oktober." },
      { word: "die Reihenfolge", meaning: "Sequential order / chronological sequence", pronunciation: "/ˈʁaɪ̯ənˌfɔlɡə/", example_sentence: "Bitte halten Sie die richtige Reihenfolge ein." }
    ],
    dialogue: [
      "Sarah: 'Wann hast du Geburtstag, Marco?'",
      "Marco: 'Mein Geburtstag ist am fünften August. Und wann hast du Geburtstag?'",
      "Sarah: 'Ich habe am einunddreißigsten Dezember Geburtstag – genau an Silvester!'",
      "Marco: 'Das ist ja ein tolles Datum! Feierst du den Jahreswechsel immer zusammen mit deinem Geburtstag?'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Marco sagt: 'Wir treffen uns am dritten Mai.' Welcher Tag im Monat ist gemeint?", answer: "Der 3. Mai.", explanation: "Die Ordinalzahl zu 3 lautet unregelmäßig 'dritte' (nicht 'dreite')." },
      { question: "🗣️ [Sprechen] Sagen Sie das heutige Datum auf Deutsch: 'Heute ist der ...'", answer: "Beispiel: 'Heute ist der fünfzehnte November.'", explanation: "Nominales Datum verwendet 'der' + Ordinalzahl auf -te." },
      { question: "📖 [Lesen & Syntax] Ergänzen Sie: 'Die Konferenz beginnt am _____ (12.) Oktober.'", answer: "zwölften", explanation: "Nach der temporalen Präposition 'am' steht die Dativ-Endung -ten." },
      { question: "✍️ [Schreiben] Schreiben Sie Ihr Geburtsdatum als vollständigen deutschen Satz auf.", answer: "Ich bin am [Datum in Worten] geboren.", explanation: "Korrekte Anwendung der Ordinalzahl im geschriebenen Satz." }
    ],
    homework: [
      "Notieren Sie die Geburtstage von 4 Familienmitgliedern mit 'am ...-ten'.",
      "Schreiben Sie die Ordinalzahlen von 1. bis 20. als Wörter auf."
    ],
    boardNotes: "Ordinalzahlen & Datum:\n• 1.-19.: Zahl + te (der zweite, vierte... Unregelmäßig: der erste, dritte, siebte, achte!)\n• ab 20.: Zahl + ste (der zwanzigste, dreißigste)\n• Datum im Satz: 'am' + Ordinalzahl + ten ('am ersten Januar', 'am zehnten Mai')"
  },

  trennbare_verben: {
    thematicKey: "trennbare_verben",
    topicTitle: "Trennbare Verben im Präsens und die deutsche Satzklammer",
    grammarFocus: "Abtrennung der Vorsilbe im Hauptsatz (Präfix wandert ans absolute Satzende), typische Vorsilben: auf-, an-, ein-, mit-, ab-, fern-",
    pedagogicalObjective: "Den Tagesablauf mit trennbaren Verben strukturieren und die Satzklammer korrekt bilden.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "aufstehen (steht auf)", meaning: "To get up / wake up (separable)", pronunciation: "/ˈaʊ̯fˌʃteːən/", example_sentence: "Ich stehe jeden Morgen um sechs Uhr auf." },
      { word: "einkaufen (kauft ein)", meaning: "To shop / buy groceries (separable)", pronunciation: "/ˈaɪ̯nˌkaʊ̯fn̩/", example_sentence: "Wir kaufen am Nachmittag im Supermarkt ein." },
      { word: "anrufen (ruft an)", meaning: "To call by phone (separable)", pronunciation: "/ˈanˌʁuːfn̩/", example_sentence: "Rufst du mich heute Abend kurz an?" },
      { word: "mitbringen (bringt mit)", meaning: "To bring along (separable)", pronunciation: "/ˈmɪtˌbʁɪŋən/", example_sentence: "Er bringt eine Flasche Saft zur Party mit." }
    ],
    dialogue: [
      "Max: 'Wann stehst du sonntags auf, Anna?'",
      "Anna: 'Sonntags schlafe ich lange und stehe erst um zehn Uhr auf. Und du?'",
      "Max: 'Ich stehe um acht Uhr auf, frühstücke gemütlich und kaufe frische Brötchen ein.'",
      "Anna: 'Klasse! Bringst du mir bitte zwei Croissants mit?'",
      "Max: 'Ja klar, mache ich gern! Danach rufe ich dich an.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Max sagt: 'Ich kaufe heute im Supermarkt ein.' Wohin gehört die Vorsilbe 'ein'?", answer: "Ganz ans Satzende.", explanation: "Die Satzklammer schließt den Satz mit dem abgetrennten Präfix ab." },
      { question: "🗣️ [Sprechen] Bilden Sie einen Satz mit 'aufstehen' für 'du' und 'sieben Uhr'.", answer: "'Du stehst um sieben Uhr auf.'", explanation: "Konjugiertes Verb an Position 2, Vorsilbe 'auf' am Satzende." },
      { question: "📖 [Lesen & Syntax] Bringen Sie die Wörter in die richtige Reihenfolge: [Er / seine Mutter / ruft / jeden Sonntag / an]", answer: "Er ruft jeden Sonntag seine Mutter an.", explanation: "Verb 'ruft' an Position 2, Präfix 'an' schließt die Satzklammer am Ende." },
      { question: "✍️ [Schreiben] Schreiben Sie zwei Sätze über Ihren Morgen mit 'aufwachen' und 'aufstehen'.", answer: "Ich wache um sieben Uhr auf. Dann stehe ich sofort auf.", explanation: "Festigt den Rhythmus trennbarer Verben im Satzbau." }
    ],
    homework: [
      "Beschreiben Sie Ihren typischen Tagesablauf in 5 Sätzen mit trennbaren Verben (aufstehen, fernsehen, anrufen...).",
      "Lernen Sie die Liste der trennbaren Präfixe: ab-, an-, auf-, aus-, ein-, mit-, vor-, zu-."
    ],
    boardNotes: "Trennbare Verben & Satzklammer:\nSubjekt + [konjugiertes Verb] + Mittelfeld + [VORSILBE AM ENDE]\n• aufstehen: Ich [stehe] um 6 Uhr [auf].\n• einkaufen: Er [kauft] im Supermarkt [ein].\n• anrufen: Wir [rufen] den Arzt [an]."
  },

  untrennbare_verben: {
    thematicKey: "untrennbare_verben",
    topicTitle: "Untrennbare Verben: Feste Vorsilben (be-, ge-, er-, ver-, zer-)",
    grammarFocus: "Untrennbarkeit von Präfixen mit unbetontem Anlaut (kein Trennen im Präsens, Partizip II ohne 'ge-')",
    pedagogicalObjective: "Untrennbare Verben erkennen, korrekt betonen und von trennbaren Verben unterscheiden.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "verstehen", meaning: "To understand (inseparable prefix ver-)", pronunciation: "/fɛɐ̯ˈʃteːən/", example_sentence: "Ich verstehe die Grammatikregel jetzt ganz klar." },
      { word: "bekommen", meaning: "To receive / get (inseparable prefix be-)", pronunciation: "/bəˈkɔmən/", example_sentence: "Er bekommt morgen einen Brief von der Universität." },
      { word: "erklären", meaning: "To explain (inseparable prefix er-)", pronunciation: "/ɛɐ̯ˈklɛːʁən/", example_sentence: "Die Lehrerin erklärt die Aufgabe sehr geduldig." },
      { word: "bezahlen", meaning: "To pay for (inseparable prefix be-)", pronunciation: "/bəˈtsaːlən/", example_sentence: "Wir bezahlen die Rechnung zusammen mit Karte." }
    ],
    dialogue: [
      "Student: 'Entschuldigung, Herr Hoffmann! Ich verstehe diese Übung noch nicht ganz.'",
      "Herr Hoffmann: 'Kein Problem! Ich erkläre Ihnen den Beispielsatz noch einmal Schritt für Schritt.'",
      "Student: 'Vielen Dank! Jetzt habe ich es verstanden. Bekommen wir dazu auch Hausaufgaben?'",
      "Herr Hoffmann: 'Ja, Sie bekommen zwei kurze Übungen zur Wiederholung.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Warum wird 'verstehen' nicht getrennt? (Nicht: 'Ich stehe ver')", answer: "Weil die Vorsilbe 'ver-' untrennbar und unbetont ist.", explanation: "Die Vorsilben be-, ge-, er-, ver-, zer-, ent-, emp-, miss- werden niemals abgetrennt." },
      { question: "🗣️ [Sprechen] Sprechen Sie den Satz laut: 'Der Kellner erklärt das Menü und wir bezahlen.'", answer: "Deutliche Betonung auf dem Verbstamm (-klär-, -zahl-), nicht auf der Vorsilbe.", explanation: "Untrennbare Präfixe tragen keine Betonung." },
      { question: "📖 [Lesen & Syntax] Welches Verb ist trennbar und welches untrennbar: 'einkaufen' vs. 'verkaufen'?", answer: "'einkaufen' ist trennbar (Ich kaufe ein); 'verkaufen' ist untrennbar (Ich verkaufe mein Auto).", explanation: "Präfix 'ein-' ist betont & trennbar; 'ver-' ist unbetont & untrennbar." },
      { question: "✍️ [Schreiben] Bilden Sie zwei Sätze mit 'bezahlen' und 'verstehen'.", answer: "Ich bezahle den Kaffee. Verstehst du mich gut?", explanation: "Präsens-Anwendung ohne Präfixtrennung." }
    ],
    homework: [
      "Merken Sie sich den Merkvers für untrennbare Vorsilben: 'be-, ge-, er-, ver-, zer-, ent-, emp-, miss-'.",
      "Schreiben Sie zu jedem der 4 Verben (verstehen, bekommen, erklären, bezahlen) einen eigenen Beispielsatz."
    ],
    boardNotes: "Untrennbare Verben:\n• Feste Präfixe: be-, ge-, er-, ver-, zer-, ent-, emp-, miss-\n• Die Vorsilbe bleibt IMMER fest am Verbstamm!\n• Betonung liegt auf dem Wortstamm (ver-STEH-en, be-KOMM-en, er-KLÄR-en)"
  },

  kasus_cases: {
    thematicKey: "kasus_cases",
    topicTitle: "Die Fälle im A1: Nominativ und Akkusativ (Direktes Objekt)",
    grammarFocus: "Akkusativveränderung ausschließlich beim maskulinen Artikel (der -> den, ein -> einen, kein -> keinen; das/die bleiben unverändert)",
    pedagogicalObjective: "Subjekt (Nominativ) und direktes Objekt (Akkusativ) identifizieren und Artikel richtig deklinieren.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "der Schlüssel -> den Schlüssel", meaning: "The key (Masculine Nominative -> Accusative)", pronunciation: "/deːɐ̯ ˈʃlʏsl̩ -> deːn ˈʃlʏsl̩/", example_sentence: "Hier ist der Schlüssel. Ich nehme den Schlüssel mit." },
      { word: "ein / einen (Akk. Mask.)", meaning: "Indefinite article masculine shift: ein -> einen", pronunciation: "/aɪ̯n -> ˈaɪ̯nən/", example_sentence: "Ich möchte bitte einen Apfel und einen Kaffee." },
      { word: "das Buch / die Tasche", meaning: "Neutral and feminine objects (unchanged in Accusative)", pronunciation: "/das buːx / diː ˈtaʃə/", example_sentence: "Sie liest das Buch und kauft die rote Tasche." },
      { word: "kein / keinen", meaning: "Negative article in Accusative", pronunciation: "/kaɪ̯n / ˈkaɪ̯nən/", example_sentence: "Ich habe keinen Kugelschreiber dabei." }
    ],
    dialogue: [
      "Tim: 'Hast du den Autoschlüssel gesehen, Lisa?'",
      "Lisa: 'Nein, ich habe den Schlüssel nicht. Aber ich sehe hier einen Rucksack und das Buch.'",
      "Tim: 'Gut, ich nehme den Rucksack und packe einen Apfel und eine Wasserflasche ein.'",
      "Lisa: 'Vergiss nicht deinen Ausweis! Brauchst du noch einen Stift?'",
      "Tim: 'Danke! Ich habe schon einen Stift in der Tasche.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Lisa sagt: 'Ich kaufe den Tisch.' Warum heißt es 'den' und nicht 'der'?", answer: "Weil 'der Tisch' das direkte Objekt (Akkusativ) nach 'kaufen' ist.", explanation: "Im Akkusativ wird nur die maskuline Form zu 'den' / 'einen' verändert." },
      { question: "🗣️ [Sprechen] Bestellen Sie höflich einen Kaffee und ein Wasser: 'Ich möchte bitte...'", answer: "'Ich möchte bitte einen Kaffee und ein Wasser.'", explanation: "Kaffee ist maskulin (einen Kaffee); Wasser ist neutral (ein Wasser)." },
      { question: "📖 [Lesen & Syntax] Wählen Sie den richtigen Artikel: 'Ich habe _____ (der / den / das) Laptop vergessen.'", answer: "den", explanation: "Laptop ist maskulin; als direktes Objekt im Akkusativ steht 'den'." },
      { question: "✍️ [Schreiben] Schreiben Sie 2 Verneinungssätze mit 'keinen' (maskulin) und 'keine' (feminin).", answer: "Ich trinke keinen Tee. Ich habe keine Zeit.", explanation: "Negation im Akkusativ." }
    ],
    homework: [
      "Füllen Sie die Artikeltabelle für Nominativ und Akkusativ (der/den, die/die, das/das, ein/einen...) aus.",
      "Bilden Sie 5 Sätze mit den Akkusativ-Verben: haben, brauchen, suchen, kaufen, finden."
    ],
    boardNotes: "Kasus A1 (Nominativ vs. Akkusativ):\n• Nominativ = Wer/Was handelt? (Subjekt) -> der / das / die / ein / ein / eine\n• Akkusativ = Wen/Was betrifft es? (Direktes Objekt):\n  - Maskulin: DER -> DEN | EIN -> EINEN | KEIN -> KEINEN\n  - Neutrum: DAS -> DAS | EIN -> EIN | KEIN -> KEIN (bleibt gleich!)\n  - Feminin: DIE -> DIE | EINE -> EINE | KEINE -> KEINE (bleibt gleich!)"
  },

  modal_verben: {
    thematicKey: "modal_verben",
    topicTitle: "Die Modalverben im Präsens (können, müssen, wollen, möchten)",
    grammarFocus: "Subjektbezogene Konjugation der Modalverben mit Vokalwechsel in Singular, Vollverb im Infinitiv am Satzende",
    pedagogicalObjective: "Fähigkeiten, Pflichten, Absichten und höfliche Wünsche mit Modalverben und Satzendstellung ausdrücken.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "können (kann, kannst, kann)", meaning: "Can / to be able to (ability or possibility)", pronunciation: "/ˈkœnən (kan)/", example_sentence: "Ich kann schon ein bisschen Deutsch sprechen." },
      { word: "müssen (muss, musst, muss)", meaning: "Must / to have to (necessity or obligation)", pronunciation: "/ˈmʏsn̩ (mʊs)/", example_sentence: "Wir müssen heute noch die Vokabeln wiederholen." },
      { word: "wollen / möchten", meaning: "To want / would like (intention vs. polite wish)", pronunciation: "/ˈvɔlən / ˈmœçtn̩/", example_sentence: "Ich möchte bitte einen Platz reservieren." },
      { word: "dürfen (darf, darfst, darf)", meaning: "May / to be allowed to (permission)", pronunciation: "/ˈdʏʁfn̩ (daʁf)/", example_sentence: "Hier darf man nicht parken." }
    ],
    dialogue: [
      "Felix: 'Hallo Laura! Kannst du heute Nachmittag mit mir in die Bibliothek kommen?'",
      "Laura: 'Hallo Felix! Leider kann ich heute nicht. Ich muss für meine Chemieprüfung lernen.'",
      "Felix: 'Schade! Möchtest du dann am Wochenende zusammen ins Kino gehen?'",
      "Laura: 'Ja sehr gern! Am Samstag will ich mich entspannen. Welchen Film wollen wir sehen?'",
      "Felix: 'Wir können eine neue Komödie sehen. Ich reserviere die Tickets!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Laura sagt: 'Ich muss heute lernen.' Wo steht das Vollverb 'lernen'?", answer: "Ganz am Ende des Satzes im Infinitiv.", explanation: "Modalverbkonstruktionen bilden eine Satzklammer: Modalverb auf Position 2, Infinitiv am Satzende." },
      { question: "🗣️ [Sprechen] Sagen Sie auf Deutsch, was Sie heute machen müssen und was Sie machen möchten.", answer: "Beispiel: 'Ich muss heute arbeiten, aber ich möchte abends Musik hören.'", explanation: "Übt den Kontrast zwischen Pflicht (müssen) und Wunsch (möchten)." },
      { question: "📖 [Lesen & Syntax] Bringen Sie die Wörter in die richtige Reihenfolge: [kann / sehr gut / schwimmen / Maria]", answer: "Maria kann sehr gut schwimmen.", explanation: "Subjekt + Modalverb (Position 2) + Ergänzung + Infinitiv (Ende)." },
      { question: "✍️ [Schreiben] Konjugieren Sie 'können' für: ich, du, er/sie/es, wir.", answer: "ich kann, du kannst, er/sie/es kann, wir können.", explanation: "1. und 3. Person Singular sind bei allen Modalverben endungslos identisch!" }
    ],
    homework: [
      "Schreiben Sie 4 Sätze über Ihre Fähigkeiten und Pflichten mit 'können' und 'müssen'.",
      "Lernen Sie die unregelmäßigen Singularformen: ich kann, ich muss, ich will, ich darf."
    ],
    boardNotes: "Modalverben im Präsens:\nSatzbau: Subjekt + [MODALVERB auf Pos. 2] + ... + [INFINITIV AM SATZENDE]\n• Besonderheit: 1. und 3. Person Singular haben KEINE Endung und gleichen sich!\n  - ich kann / er kann\n  - ich muss / er muss\n  - ich will / er will\n  - ich möchte / er möchte"
  },

  w_fragen: {
    thematicKey: "w_fragen",
    topicTitle: "W-Fragen: Fragewörter und gezielte Informationsfragen",
    grammarFocus: "Fragewörter mit 'W-' an Position 1, finites Verb an Position 2, Subjekt an Position 3",
    pedagogicalObjective: "Offene Fragen mit Wer, Was, Wo, Woher, Wohin, Wann und Wie formulieren und beantworten.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "Wer? / Was?", meaning: "Who? (Person inquiry) / What? (Object or action inquiry)", pronunciation: "/veːɐ̯ / vas/", example_sentence: "Wer ist das? – Das ist meine Kollegin. Was machst du?" },
      { word: "Wo? / Woher? / Wohin?", meaning: "Where? (Location) / Where from? (Origin) / Where to? (Destination)", pronunciation: "/voː / voːˈheːɐ̯ / voːˈhɪn/", example_sentence: "Wo wohnst du? Woher kommst du? Wohin fährst du?" },
      { word: "Wann? / Wie?", meaning: "When? (Time) / How? (Manner or condition)", pronunciation: "/van / viː/", example_sentence: "Wann beginnt der Kurs? Wie heißt du mit Nachnamen?" },
      { word: "die Frage stellen", meaning: "To ask a question", pronunciation: "/diː ˈfʁaːɡə ˈʃtɛlən/", example_sentence: "Darf ich Ihnen eine kurze Frage stellen?" }
    ],
    dialogue: [
      "Interviewer: 'Guten Tag! Wie heißen Sie und woher kommen Sie?'",
      "Kandidatin: 'Guten Tag! Mein Name ist Maria Santos und ich komme aus Brasilien.'",
      "Interviewer: 'Wo wohnen Sie zurzeit in Deutschland?'",
      "Kandidatin: 'Ich wohne in Köln. Mein Kurs beginnt jeden Tag um neun Uhr.'",
      "Interviewer: 'Und warum lernen Sie Deutsch?'",
      "Kandidatin: 'Weil ich in Deutschland als Ingenieurin arbeiten möchte.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Auf welche Frage antwortet man mit: 'Ich komme aus Spanien'?", answer: "'Woher kommst du?' (oder formell: 'Woher kommen Sie?')", explanation: "'Woher' fragt nach der Herkunft; Signalpräposition ist 'aus'." },
      { question: "🗣️ [Sprechen] Stellen Sie Ihrem Gesprächspartner 3 Fragen zu Name, Wohnort und Hobbys.", answer: "'Wie heißt du? Wo wohnst du? Was machst du in der Freizeit?'", explanation: "Übt flüssiges Fragenstellen im Kennenlerndialog." },
      { question: "📖 [Lesen & Syntax] Setzen Sie das passende Fragewort ein: '_____ kostet die Fahrkarte nach Berlin?'", answer: "Wie viel", explanation: "'Wie viel' fragt nach dem Preis oder einer Menge." },
      { question: "✍️ [Schreiben] Formulieren Sie zu der Antwort 'Der Kurs beginnt um 18 Uhr' die passende W-Frage.", answer: "Wann beginnt der Kurs?", explanation: "Inversion und Zuordnung der Zeitfrage mit 'Wann'." }
    ],
    homework: [
      "Erstellen Sie ein Interview mit 5 W-Fragen an eine berühmte Persönlichkeit.",
      "Unterscheiden Sie schriftlich: Wo (Ort), Woher (Herkunft), Wohin (Richtung)."
    ],
    boardNotes: "W-Fragen Satzstruktur:\n[W-Wort (Pos. 1)] + [Verb (Pos. 2)] + [Subjekt (Pos. 3)] + Ergänzungen?\n• Wer = Personen (Wer ist das?)\n• Was = Dinge/Aktivitäten (Was machst du?)\n• Wo = Ort (Wo bist du?)\n• Woher = Herkunft (Woher kommst du?)\n• Wohin = Ziel (Wohin gehst du?)\n• Wann = Zeit (Wann treffen wir uns?)\n• Wie = Art/Weise (Wie geht es dir?)"
  },

  ja_nein_fragen: {
    thematicKey: "ja_nein_fragen",
    topicTitle: "Ja/Nein-Fragen, Verbinversion und Antwortpartikeln (Ja, Nein, Doch)",
    grammarFocus: "Satzfragen mit Verb an Position 1, Subjekt an Position 2; Beantwortung negierter Fragen mit 'Doch'",
    pedagogicalObjective: "Geschlossene Fragen formulieren und verneinte Fragen mit 'Doch' sicher beantworten.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "die Verbinversion", meaning: "Verb inversion (moving finite verb to position 1 in questions)", pronunciation: "/ˈvɛʁp.ɪnvɛʁˌzi̯oːn/", example_sentence: "Bei einer Ja/Nein-Frage steht das Verb an Position 1." },
      { word: "Ja / Nein / Vielleicht", meaning: "Yes / No / Maybe (standard answer particles)", pronunciation: "/jaː / naɪ̯n / fiːˈlaɪ̯çt/", example_sentence: "Trinkst du Kaffee? – Ja, gern! / Nein, danke." },
      { word: "Doch!", meaning: "Contradicting affirmative answer to a negative question", pronunciation: "/dɔx/", example_sentence: "Lernst du kein Deutsch? – Doch, ich lerne Deutsch!" },
      { word: "stimmen", meaning: "To be correct / right", pronunciation: "/ˈʃtɪmən/", example_sentence: "Stimmt das so? – Ja, das stimmt genau." }
    ],
    dialogue: [
      "Jonas: 'Kommst du heute mit ins Café, Sandra?'",
      "Sandra: 'Ja, gern! Hast du schon deine Hausaufgaben gemacht?'",
      "Jonas: 'Nein, noch nicht ganz, aber ich mache sie später.'",
      "Sandra: 'Hast du denn heute keine Lust auf ein Eis?'",
      "Jonas: 'Doch! Ich liebe Schokoladeneis, lass uns gleich gehen!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Sandra fragt: 'Hast du kein Ticket?' Jonas antwortet: 'Doch!' Was bedeutet das?", answer: "Er HAT ein Ticket (er widerspricht der verneinten Frage).", explanation: "'Doch' bejaht eine Frage, die eine Verneinung (kein/nicht) enthält." },
      { question: "🗣️ [Sprechen] Wandeln Sie den Aussagesatz 'Du lernst Deutsch' in eine Ja/Nein-Frage um.", answer: "'Lernst du Deutsch?'", explanation: "Das konjugierte Verb rückt von Position 2 auf Position 1." },
      { question: "📖 [Lesen & Syntax] Welche Antwort ist richtig? Frage: 'Trinkst du keinen Tee?' Antwort: [Nein / Doch], ich trinke sehr gern Grüntee!", answer: "Doch", explanation: "'Doch' hebt die Verneinung der Frage auf." },
      { question: "✍️ [Schreiben] Schreiben Sie 2 Ja/Nein-Fragen zu Hobbys und die Antworten darauf.", answer: "– 'Spielst du Gitarre?' – 'Ja, ich spiele Gitarre.' / 'Nein, ich spiele Klavier.'", explanation: "Festigt Entscheidungsfragen und Antworten." }
    ],
    homework: [
      "Üben Sie 3 Dialoge mit der Antwortpartikel 'Doch!' bei negierten Fragen.",
      "Wandeln Sie 5 Aussagesätze in Satzfragen um."
    ],
    boardNotes: "Ja/Nein-Fragen (Satzfragen):\n[VERB (Pos. 1)] + [Subjekt (Pos. 2)] + Rest?\n• Kommst du aus Deutschland? -> Ja, ich komme aus Deutschland. / Nein, aus Österreich.\nAntwort auf verneinte Fragen:\n• Lernst du NICHT? -> Doch! (Ich lerne!)\n• Hast du KEIN Geld? -> Doch! (Ich habe Geld!)"
  },

  praepositionen: {
    thematicKey: "praepositionen",
    topicTitle: "Präpositionen im A1: Lokale und temporale Angaben mit Dativ und Akkusativ",
    grammarFocus: "A1-Präpositionen mit festem Fall: mit (+Dat), nach (+Dat), zu (+Dat), aus (+Dat); für (+Akk); Verschmelzungen im/am/zum/zur",
    pedagogicalObjective: "Transportmittel, Wege und Zeitpunkte mit korrekten Präpositionen und Artikeln ausdrücken.",
    cefrLevel: "A1",
    cefrScaffoldingNote: "Akademische Niveau-Kalibrierung: Wechselpräpositionen werden im A1 nur mit statischem Dativ (Wo? im Park, an der Station) und festen Grundpräpositionen vermittelt; die systematische A2-Kasusunterscheidung (Wohin -> Akk vs. Wo -> Dat) folgt im Folgemodul.",
    vocabulary: [
      { word: "mit (+ Dativ)", meaning: "With / by means of transport (takes Dative: mit dem Bus, mit der Bahn)", pronunciation: "/mɪt/", example_sentence: "Ich fahre jeden Tag mit dem Bus zur Arbeit." },
      { word: "nach / zu (+ Dativ)", meaning: "To / towards (geographical to country/city vs. to person/place)", pronunciation: "/naːx / tsuː/", example_sentence: "Wir fahren nach Berlin und gehen zum Arzt." },
      { word: "für (+ Akkusativ)", meaning: "For (always requires Accusative: für mich, für den Freund)", pronunciation: "/fyːɐ̯/", example_sentence: "Dieses Geschenk ist für meinen Bruder." },
      { word: "am / im / um", meaning: "Temporal contractions: am (an dem Tag), im (in dem Monat), um (exact hour)", pronunciation: "/am / ɪm / ʊm/", example_sentence: "Am Montag, im Sommer, um acht Uhr." }
    ],
    dialogue: [
      "Katja: 'Wie kommst du morgens zur Sprachschule, Florian?'",
      "Florian: 'Ich fahre zuerst mit der U-Bahn und gehe dann zu Fuß zur Schule. Und du?'",
      "Katja: 'Ich fahre meistens mit dem Fahrrad. Das ist gut für die Fitness!'",
      "Florian: 'Toll! Treffen wir uns nach dem Unterricht im Café an der Ecke?'",
      "Katja: 'Sehr gern, um halb zwei nach der letzten Stunde!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Florian sagt: 'Ich fahre mit dem Bus.' Welcher Kasus steht nach 'mit'?", answer: "Dativ (der Bus -> dem Bus).", explanation: "Die Präposition 'mit' verlangt im Deutschen immer zwingend den Dativ." },
      { question: "🗣️ [Sprechen] Erklären Sie, wie Sie zur Schule oder zur Arbeit kommen: 'Ich fahre mit ...'", answer: "Beispiel: 'Ich fahre mit dem Auto / mit der Bahn / mit dem Zug.'", explanation: "Sichere Zuordnung der Dativformen bei Verkehrsmitteln." },
      { question: "📖 [Lesen & Syntax] Setzen Sie die passende Kontraktion ein: 'Wir treffen uns _____ (an + dem) Bahnhof.'", answer: "am", explanation: "'an dem' verschmilzt im Deutschen standardmäßig zu 'am'." },
      { question: "✍️ [Schreiben] Schreiben Sie einen Satz mit 'für' + Maskulinum (den/einen).", answer: "Ich kaufe eine Tasse für meinen Vater.", explanation: "'für' verlangt den Akkusativ." }
    ],
    homework: [
      "Schreiben Sie 5 Sätze mit Verkehrsmitteln und 'mit dem / mit der'.",
      "Merken Sie sich die Verschmelzungen: in + dem = im, an + dem = am, zu + der = zur, zu + dem = zum."
    ],
    boardNotes: "A1-Präpositionen im Überblick:\n• MIT + Dativ: mit dem Zug (m), mit dem Auto (n), mit der U-Bahn (f)\n• ZU + Dativ: zum Bahnhof (m), zum Supermarkt (m), zur Schule (f)\n• FÜR + Akkusativ: für den Freund (m), für das Kind (n), für die Mutter (f)\n• Zeitangaben: AM Montag / AM Vormittag | IM Mai / IM Winter | UM 8 Uhr"
  },

  perfekt: {
    thematicKey: "perfekt",
    topicTitle: "Das Perfekt im Alltag: Vergangenes mit haben und sein beschreiben",
    grammarFocus: "Hilfsverb 'haben' oder 'sein' auf Position 2, Partizip II (ge- ... -t / ge- ... -en) am Satzende",
    pedagogicalObjective: "Über Wochenendaktivitäten, Urlaube und vergangene Ereignisse im mündlichen Sprachgebrauch berichten.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "haben / sein (Hilfsverben)", meaning: "Auxiliary verbs in Perfekt (haben for actions; sein for movement/change of state)", pronunciation: "/ˈhaːbn̩ / zaɪ̯n/", example_sentence: "Ich habe gelernt. Er ist nach Hause gegangen." },
      { word: "gemacht / gelernt / gekauft", meaning: "Regular participles: ge + Stamm + t", pronunciation: "/ɡəˈmaxt, ɡəˈlɛʁnt, ɡəˈkaʊ̯ft/", example_sentence: "Ich habe heute meine Hausaufgaben gemacht." },
      { word: "gegangen / gefahren", meaning: "Movement participles taking 'sein': went / travelled", pronunciation: "/ɡəˈɡaŋən / ɡəˈfaːʁən/", example_sentence: "Wir sind am Wochenende nach München gefahren." },
      { word: "gestern / am Wochenende", meaning: "Temporal signal words for past narrative", pronunciation: "/ˈɡɛstɐn / am ˈvɔxn̩ˌʔɛndə/", example_sentence: "Gestern habe ich mit Freunden Pizza gegessen." }
    ],
    dialogue: [
      "Tim: 'Hallo Laura! Was hast du am Wochenende schönes gemacht?'",
      "Laura: 'Hallo Tim! Ich habe am Samstag Freunde getroffen und wir haben zusammen gekocht. Und du?'",
      "Tim: 'Ich bin mit dem Zug an die Ostsee gefahren und habe lange am Strand spaziert.'",
      "Laura: 'Das klingt wunderbar! Hast du auch im Hotel übernachtet?'",
      "Tim: 'Ja, ich bin bis Sonntag geblieben und habe mich sehr gut erholt.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Tim sagt: 'Ich bin gefahren.' Warum verwendet er 'sein' und nicht 'haben'?", answer: "Weil 'fahren' eine Ortsveränderung (Bewegung von A nach B) ausdrückt.", explanation: "Verben der Bewegung und Zustandsänderung bilden das Perfekt mit 'sein'." },
      { question: "🗣️ [Sprechen] Bilden Sie das Perfekt zu dem Satz: 'Ich lerne Deutsch.'", answer: "'Ich habe Deutsch gelernt.'", explanation: "Hilfsverb 'habe' auf Position 2, regelmäßiges Partizip II 'gelernt' am Satzende." },
      { question: "📖 [Lesen & Syntax] Wählen Sie das richtige Hilfsverb: 'Er _____ (hat / ist) gestern nach Hause gekommen.'", answer: "ist", explanation: "'kommen' ist ein Verb der Bewegung -> Perfekt mit 'sein'." },
      { question: "✍️ [Schreiben] Schreiben Sie 2 Sätze über Ihren gestrigen Tag im Perfekt.", answer: "Gestern habe ich Sport gemacht. Um zehn Uhr bin ich ins Bett gegangen.", explanation: "Kombiniert Hilfsverben haben und sein mit korrekter Satzklammer." }
    ],
    homework: [
      "Schreiben Sie 5 Sätze im Perfekt über Ihr letztes Wochenende.",
      "Erstellen Sie zwei Spalten im Heft: 'Perfekt mit haben' und 'Perfekt mit sein'."
    ],
    boardNotes: "Das Perfekt (Gesprochene Vergangenheit):\nSubjekt + [HABEN / SEIN auf Pos. 2] + ... + [PARTIZIP II AM ENDE]\n• Perfekt mit HABEN (die meisten Verben): Ich habe gearbeitet / gekauft / gehört.\n• Perfekt mit SEIN (Bewegung & Zustandswechsel): Ich bin gegangen / gefahren / aufgestanden / geblieben."
  },

  imperativ: {
    thematicKey: "imperativ",
    topicTitle: "Der Imperativ: Bitten, Aufforderungen und Anweisungen im Klassenraum",
    grammarFocus: "Formen des Imperativs: du-Form (ohne -st, ohne 'du'), ihr-Form (wie Präsens), Sie-Form (Inversion: Machen Sie!)",
    pedagogicalObjective: "Anweisungen im Kursraum verstehen, freundliche Ratschläge und Aufforderungen formulieren.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "Kommen Sie! / Machen Sie!", meaning: "Formal polite imperative with 'Sie' (inversion)", pronunciation: "/ˈkɔmən ziː / ˈmaxn̩ ziː/", example_sentence: "Kommen Sie bitte herein und nehmen Sie Platz!" },
      { word: "Lies! / Sprich!", meaning: "Informal singular imperative (du-form dropping -st; e->i vowel change preserved)", pronunciation: "/liːs / ʃpʁɪç/", example_sentence: "Lies den Text bitte laut vor!" },
      { word: "Macht! / Hört zu!", meaning: "Informal plural imperative (ihr-form without pronoun)", pronunciation: "/maxt / hœːɐ̯t tsuː/", example_sentence: "Macht bitte die Bücher auf Seite 20 auf!" },
      { word: "bitte / mal", meaning: "Politeness softening particles", pronunciation: "/ˈbɪtə / maːl/", example_sentence: "Wiederholen Sie das bitte noch einmal!" }
    ],
    dialogue: [
      "Lehrerin: 'Guten Morgen allerseits! Öffnen Sie bitte Ihre Kursbücher auf Seite 45!'",
      "Schüler: 'Frau Klein, sollen wir die Aufgabe 3 lesen?'",
      "Lehrerin: 'Ja genau. Markus, fang bitte an und lies die erste Zeile laut vor!'",
      "Markus: 'Gern! Und was machen wir danach?'",
      "Lehrerin: 'Hört alle gut zu und korrigiert eventuelle Aussprachefehler!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Die Lehrerin sagt: 'Wiederholen Sie bitte!' An wen richtet sich diese Aufforderung?", answer: "An eine oder mehrere Personen in formeller Höflichkeitsform (Sie).", explanation: "Imperativ mit 'Sie' behält das Pronomen als Inversion direkt hinter dem Verb." },
      { question: "🗣️ [Sprechen] Bitten Sie einen Mitschüler informell, das Fenster zu öffnen: 'Mach bitte...'", answer: "'Mach bitte das Fenster auf!'", explanation: "Informeller Imperativ Singular (du) lässt Personalpronomen und die Endung -st weg." },
      { question: "📖 [Lesen & Syntax] Bilden Sie den Imperativ für 'du' von 'helfen': [hilfst -> ?]", answer: "Hilf!", explanation: "Verben mit Vokalwechsel e -> i behalten den Vokalwechsel im Imperativ (Hilf!, Lies!, Sprich!)." },
      { question: "✍️ [Schreiben] Formulieren Sie 2 höfliche Bitten mit 'bitte' an Ihren Lehrer.", answer: "Erklären Sie das bitte noch einmal! Sprechen Sie bitte etwas langsamer!", explanation: "Höflicher Imperativ im Sprachunterricht." }
    ],
    homework: [
      "Notieren Sie 5 typische Arbeitsanweisungen aus Ihrem Deutschbuch (z.B. Hören Sie zu, Kreuzen Sie an).",
      "Bilden Sie zu 3 Verben (gehen, schreiben, lesen) alle 3 Imperativformen (du, ihr, Sie)."
    ],
    boardNotes: "Imperativformen:\n• du-Form: Stamm ohne -st, OHNE 'du' (gehen -> Geh! | lesen -> Lies!)\n• ihr-Form: Wie Präsens, OHNE 'ihr' (gehen -> Geht! | machen -> Macht!)\n• Sie-Form: Verb + Sie + bitte! (Gehen Sie bitte! | Lesen Sie bitte!)\n• Höflichkeit: Immer 'bitte' verwenden!"
  },

  konnektoren: {
    thematicKey: "konnektoren",
    topicTitle: "Konnektoren und Satzverbindung: Hauptsätze verbinden mit Position 0",
    grammarFocus: "Koordinierende Konjunktionen (und, aber, oder, denn) auf Position 0 (keine Auswirkung auf die normale Wortstellung)",
    pedagogicalObjective: "Aussagen logisch verbinden, Begründungen (denn) und Kontraste (aber) fehlerfrei ausdrücken.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "und / oder", meaning: "And (addition) / Or (alternative) on Position 0", pronunciation: "/ʊnt / ˈoːdɐ/", example_sentence: "Ich lerne Deutsch und meine Schwester lernt Spanisch." },
      { word: "aber", meaning: "But (contrast or limitation) on Position 0", pronunciation: "/ˈaːbɐ/", example_sentence: "Der Kurs ist anspruchsvoll, aber er macht großen Spaß." },
      { word: "denn", meaning: "Because / for (casual explanation) on Position 0", pronunciation: "/dɛn/", example_sentence: "Ich trinke Wasser, denn ich habe großen Durst." },
      { word: "Position 0", meaning: "Connector position that does NOT shift the finite verb", pronunciation: "/poziˈtsi̯oːn nʊl/", example_sentence: "Bei 'denn' bleibt das Verb an Position 2." }
    ],
    dialogue: [
      "Daniel: 'Kommst du heute Abend mit ins Kino oder bleibst du zu Hause?'",
      "Julia: 'Ich möchte gern mitkommen, aber ich habe noch viel Arbeit.'",
      "Daniel: 'Schade! Ich gehe heute früh ins Bett, denn ich bin ziemlich müde.'",
      "Julia: 'Das verstehe ich gut. Morgen habe ich frei und dann können wir uns treffen!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Julia sagt: '..., denn ich bin müde.' An welcher Position steht das Verb 'bin'?", answer: "An Position 2 (Position 0 = denn, Position 1 = ich, Position 2 = bin).", explanation: "'denn' ist eine Position-0-Konjunktion und verändert die Verbposition nicht." },
      { question: "🗣️ [Sprechen] Verbinden Sie zwei Sätze mit 'aber': 'Ich lerne viel.' + 'Ich mache noch Fehler.'", answer: "'Ich lerne viel, aber ich mache noch Fehler.'", explanation: "Direkte Hauptsatzkoordination mit Beibehaltung der normalen Satzstellung." },
      { question: "📖 [Lesen & Syntax] Wählen Sie den passenden Konnektor: 'Ich kann nicht joggen, _____ (denn / aber / und) es regnet sehr stark.'", answer: "denn", explanation: "'denn' liefert die Begründung für die vorherige Aussage." },
      { question: "✍️ [Schreiben] Schreiben Sie einen zusammengesetzten Satz mit 'und' und einen mit 'oder'.", answer: "Ich trinke Kaffee und esse ein Croissant. Gehen wir ins Kino oder bleiben wir daheim?", explanation: "Einfache syntaktische Verknüpfung." }
    ],
    homework: [
      "Verbinden Sie 4 Satzpaare im Heft mit: und, aber, oder, denn.",
      "Merken Sie sich das Akronym ADUSO: Aber, Denn, Und, Sondern, Oder = Position 0!"
    ],
    boardNotes: "Hauptsatz-Konnektoren (Position 0):\n[Satz 1] , [KONNEKTOR (0)] + [Subjekt (1)] + [Verb (2)] + Rest.\n• UND: Ich koche und du spülst ab.\n• ABER: Er ist müde, aber er arbeitet weiter.\n• ODER: Gehen wir spazieren oder schauen wir einen Film?\n• DENN: Ich lerne Deutsch, denn ich liebe Sprachen."
  },

  uhrzeit: {
    thematicKey: "uhrzeit",
    topicTitle: "Die Uhrzeit: Offizielle und inoffizielle Zeitangaben",
    grammarFocus: "Offizielle Zeit (24-Stunden-System: 14 Uhr 30) vs. inoffizielle Zeit (Viertel nach, halb, Viertel vor, vor/nach)",
    pedagogicalObjective: "Nach der Uhrzeit fragen, Termine vereinbaren und Fahrplanauskünfte verstehen.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "Wie spät ist es? / Wie viel Uhr ist es?", meaning: "What time is it? (standard clock inquiry)", pronunciation: "/viː ʃpɛːt ɪst ɛs / viː fiːl uːɐ̯ ɪst ɛs/", example_sentence: "Entschuldigung, wie spät ist es bitte? – Es ist genau drei Uhr." },
      { word: "halb drei (14:30 / 2:30)", meaning: "Half past two (German idiom: halfway to 3!)", pronunciation: "/halp dʁaɪ̯/", example_sentence: "Der Zug kommt um halb drei am Hauptbahnhof an." },
      { word: "Viertel nach / Viertel vor", meaning: "Quarter past / Quarter to", pronunciation: "/ˈfɪʁtl̩ naːx / ˈfɪʁtl̩ foːɐ̯/", example_sentence: "Es ist Viertel nach vier; in fünfzehn Minuten beginnt der Film." },
      { word: "der Termin", meaning: "Appointment / scheduled meeting", pronunciation: "/tɛʁˈmiːn/", example_sentence: "Ich habe um zehn Uhr einen wichtigen Termin beim Arzt." }
    ],
    dialogue: [
      "Passant: 'Entschuldigen Sie bitte, wie spät ist es jetzt?'",
      "Reisender: 'Moment... es ist jetzt genau Viertel vor vier.'",
      "Passant: 'Vielen Dank! Mein Zug nach Frankfurt fährt um sechzehn Uhr zehn.'",
      "Reisender: 'Dann haben Sie noch fünfundzwanzig Minuten Zeit. Der Zug fährt von Gleis 7 ab.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Jemand sagt: 'Es ist halb fünf.' Welche Uhrzeit ist gemeint?", answer: "16:30 Uhr (oder 4:30 Uhr).", explanation: "Achtung deutsche Falle: 'halb fünf' bedeutet 30 Minuten VOR fünf, also 4:30 Uhr!" },
      { question: "🗣️ [Sprechen] Sagen Sie die Uhrzeit 15:15 Uhr sowohl inoffiziell als auch offiziell.", answer: "Inoffiziell: 'Viertel nach drei'. Offiziell: 'fünfzehn Uhr fünfzehn'.", explanation: "Gegenüberstellung von Umgangssprache und formeller Zeitangabe." },
      { question: "📖 [Lesen & Syntax] Wie lautet 08:45 Uhr in der gesprochenen Alltagssprache?", answer: "Viertel vor neun", explanation: "15 Minuten vor der vollen nächsten Stunde." },
      { question: "✍️ [Schreiben] Notieren Sie Ihren heutigen Tagesplan mit 3 Uhrzeiten (z.B. Um 7 Uhr frühstücken...).", answer: "Um 7:00 Uhr stehe ich auf. Um 13:00 Uhr esse ich zu Mittag. Um 22:30 Uhr gehe ich schlafen.", explanation: "Verbindet Uhrzeitangaben mit 'um' im Satzbau." }
    ],
    homework: [
      "Zeichnen Sie 4 Uhren in Ihr Heft und schreiben Sie die inoffizielle Uhrzeit dazu.",
      "Schreiben Sie auf, wann Sie morgen aufstehen, arbeiten und schlafen gehen."
    ],
    boardNotes: "Uhrzeit-System im Deutschen:\n1. Offiziell (Radio, Bahnhof, Termine): Stunde + 'Uhr' + Minute (14:30 = vierzehn Uhr dreißig)\n2. Inoffiziell (Alltag):\n   • :15 -> Viertel nach [Stunde]\n   • :30 -> HALB [NÄCHSTE Stunde!] (07:30 = halb acht)\n   • :45 -> Viertel vor [NÄCHSTE Stunde]"
  },

  zeitangaben: {
    thematicKey: "zeitangaben",
    topicTitle: "Zeitangaben, Tageszeiten, Wochentage und temporale Satzstellung (TeKaMoLo)",
    grammarFocus: "Präposition 'am' für Tage/Tageszeiten, temporale Adverbien (heute, morgen, gestern), Zeitangabe vor Ortsangabe",
    pedagogicalObjective: "Wochenpläne erstellen, Verabredungen treffen und zeitliche Abläufe präzise ordnen.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "am Morgen / am Abend", meaning: "In the morning / In the evening (takes 'am' = an dem)", pronunciation: "/am ˈmɔʁɡn̩ / am ˈaːbənt/", example_sentence: "Am Morgen trinke ich Kaffee und am Abend lese ich ein Buch." },
      { word: "Montag bis Sonntag", meaning: "Days of the week (all masculine: der Montag...)", pronunciation: "/ˈmoːntaːk bɪs ˈzɔntaːk/", example_sentence: "Von Montag bis Freitag besuche ich den Deutschkurs." },
      { word: "gestern, heute, morgen", meaning: "Yesterday, today, tomorrow (temporal core adverbs)", pronunciation: "/ˈɡɛstɐn, ˈhɔɪ̯tə, ˈmɔʁɡn̩/", example_sentence: "Heute lernen wir fleißig, morgen haben wir frei." },
      { word: "täglich / am Wochenende", meaning: "Daily / on the weekend", pronunciation: "/ˈtɛːklɪç / am ˈvɔxn̩ˌʔɛndə/", example_sentence: "Am Wochenende mache ich einen langen Spaziergang." }
    ],
    dialogue: [
      "Ben: 'Was machst du am Freitagabend, Leonie?'",
      "Leonie: 'Am Freitagabend gehe ich mit Kollegen ins Restaurant. Und was machst du am Wochenende?'",
      "Ben: 'Am Samstagvormittag schlafe ich aus und am Sonntagnachmittag besuche ich meine Großeltern.'",
      "Leonie: 'Das klingt nach einem entspannten Wochenende! Treffen wir uns nächsten Dienstag wieder?'",
      "Ben: 'Ja abgemacht, am Dienstag um zehn Uhr!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Wann besucht Ben seine Großeltern?", answer: "Am Sonntagnachmittag.", explanation: "Kombination aus Wochentag (Sonntag) und Tageszeit (Nachmittag) mit Präposition 'am'." },
      { question: "🗣️ [Sprechen] Zählen Sie alle 7 Wochentage auf Deutsch in der richtigen Reihenfolge auf.", answer: "Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag (oder Sonnabend), Sonntag.", explanation: "Flüssiges Abrufen der Wochentagssequenz." },
      { question: "📖 [Lesen & Syntax] Welche Präposition steht vor Wochentagen und Tageszeiten: (im / am / um)?", answer: "am", explanation: "'am' (= an dem) wird für Tage, Tageszeiten und Datumsangaben verwendet (Ausnahme: in der Nacht)." },
      { question: "✍️ [Schreiben] Schreiben Sie einen Satz mit: [heute / ich / Deutsch / lerne] und stellen Sie 'heute' an Position 1.", answer: "Heute lerne ich Deutsch.", explanation: "Inversion: Temporales Adverb auf Position 1 zieht das finite Verb auf Position 2 vor das Subjekt." }
    ],
    homework: [
      "Schreiben Sie Ihren Wochenkalender von Montag bis Sonntag mit jeweils einer Hauptaktivität.",
      "Achten Sie auf die Ausnahme bei den Tageszeiten: am Morgen, am Vormittag... aber: IN DER NACHT!"
    ],
    boardNotes: "Temporale Bausteine im A1:\n• Präposition AM: am Montag, am Dienstag... am Morgen, am Nachmittag, am Abend (aber: in der Nacht!)\n• Präposition UM: um 8 Uhr, um 15:30 Uhr\n• Präposition IM: im Januar, im Sommer\n• Satzstellung: Steht die Zeit auf Position 1, folgt sofort das Verb: 'Am Montag [gehe] ich zum Kurs.'"
  },

  adjektive: {
    thematicKey: "adjektive",
    topicTitle: "Beschreibende Adjektive, Gegenteile und prädikative Verwendung",
    grammarFocus: "Prädikative Adjektive nach sein/bleiben (unveränderlich ohne Endung: Das Haus ist groß) und grundlegende Antonympaare",
    pedagogicalObjective: "Personen, Räume und Gegenstände mit passenden Adjektiven und ihren Gegenteilen beschreiben.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "groß / klein", meaning: "Big / small (fundamental dimension antonyms)", pronunciation: "/ɡʁoːs / klaɪ̯n/", example_sentence: "Das Zimmer ist groß, aber das Bad ist klein." },
      { word: "gut / schlecht", meaning: "Good / bad (quality appraisal)", pronunciation: "/ɡuːt / ʃlɛçt/", example_sentence: "Das Wetter heute ist wirklich gut." },
      { word: "teuer / billig (günstig)", meaning: "Expensive / cheap (pricing adjectives)", pronunciation: "/ˈtɔɪ̯ɐ / ˈbɪlɪç/", example_sentence: "Das Hotel ist teuer, aber das Café ist sehr günstig." },
      { word: "schön / hässlich", meaning: "Beautiful / ugly", pronunciation: "/ʃøːn / ˈhɛslɪç/", example_sentence: "Die Altstadt ist besonders schön." }
    ],
    dialogue: [
      "Maklerin: 'Guten Tag Herr Bauer! Wie finden Sie die Wohnung hier im Stadtzentrum?'",
      "Herr Bauer: 'Die Wohnung ist sehr schön und die Räume sind wunderbar hell.'",
      "Maklerin: 'Ja, die Lage ist fantastisch. Ist Ihnen die Küche groß genug?'",
      "Herr Bauer: 'Die Küche ist etwas klein, aber der Balkon ist sehr geräumig. Nur die Miete ist leider ziemlich teuer.'",
      "Maklerin: 'Dafür sind die Nebenkosten hier sehr niedrig.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Herr Bauer sagt: 'Die Wohnung ist sehr hell.' Was ist das Gegenteil von 'hell'?", answer: "dunkel", explanation: "Antonymenbildung im beschreibenden Vokabular." },
      { question: "🗣️ [Sprechen] Beschreiben Sie Ihren Sprachkursraum mit drei Adjektiven nach 'Der Raum ist...'", answer: "Beispiel: 'Der Raum ist groß, hell und modern.'", explanation: "Prädikative Adjektive hinter dem Verb 'sein' erhalten im Deutschen keine Endung." },
      { question: "📖 [Lesen & Syntax] Ergänzen Sie das Gegenteil: 'Das neue Auto ist sehr schnell, aber das alte Fahrrad ist _____.'", answer: "langsam", explanation: "Antonymenpaar schnell / langsam." },
      { question: "✍️ [Schreiben] Bilden Sie 2 Kontrastsätze mit 'aber' und zwei Adjektivpaaren.", answer: "Der Pullover ist schön, aber zu teuer. Das Zimmer ist klein, aber sehr gemütlich.", explanation: "Kombiniert Adjektive mit Hauptsatzverbindern." }
    ],
    homework: [
      "Schreiben Sie 6 Adjektivpaare mit ihren Gegenteilen auf Kärtchen (neu/alt, warm/kalt...).",
      "Beschreiben Sie Ihre Lieblingsstadt in 4 Sätzen mit Adjektiven."
    ],
    boardNotes: "Adjektive im A1 (Prädikative Verwendung):\n• Wenn das Adjektiv hinter 'sein' steht, bleibt es UNVERÄNDERT (keine Endung!):\n  - Der Tisch ist alt.\n  - Die Lampe ist alt.\n  - Das Buch ist alt.\n  - Die Stühle sind alt.\nWichtige Gegenteile: groß/klein, gut/schlecht, teuer/billig, warm/kalt, neu/alt, schnell/langsam"
  },

  besondere_verben: {
    thematicKey: "besondere_verben",
    topicTitle: "Besondere Verben: 'wissen', 'nehmen', 'geben' und unregelmäßige Wurzeln",
    grammarFocus: "Konjugation von 'wissen' (ich weiß, du weißt, er weiß; wie Modalverb!), 'nehmen' (du nimmst, er nimmt) und unpersönliches 'es gibt + Akk'",
    pedagogicalObjective: "Auskünfte einholen, Bestellungen aufgeben und das Vorhandensein von Dingen mit 'es gibt' ausdrücken.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "wissen (weiß, weißt, weiß)", meaning: "To know a fact (irregular singular forms without standard endings)", pronunciation: "/ˈvɪsn̩ (vaɪ̯s)/", example_sentence: "Weißt du, wann der nächste Bus abfährt? – Nein, ich weiß es nicht." },
      { word: "nehmen (nimmt, nimmst)", meaning: "To take / to order food/drinks (stem vowel change e -> i with double m)", pronunciation: "/ˈneːmən (nɪmt)/", example_sentence: "Ich nehme ein Stück Kuchen und einen Kaffee." },
      { word: "es gibt (+ Akkusativ)", meaning: "There is / there are (expresses existence; requires Accusative)", pronunciation: "/ɛs ɡɪpt/", example_sentence: "In der Stadt gibt es einen schönen Park und ein Museum." },
      { word: "helfen (hilft)", meaning: "To help (takes Dative: hilft mir)", pronunciation: "/ˈhɛlfn̩ (hɪlft)/", example_sentence: "Können Sie mir bitte kurz helfen?" }
    ],
    dialogue: [
      "Kellner: 'Guten Abend! Haben Sie schon gewählt? Was möchten Sie bestellen?'",
      "Gast 1: 'Guten Abend! Ich nehme das Tagesgericht und ein Mineralwasser, bitte.'",
      "Gast 2: 'Wissen Sie vielleicht, ob es hier auch vegetarische Optionen gibt?'",
      "Kellner: 'Ja natürlich! Es gibt eine frische Gemüselasagne und einen gemischten Salat.'",
      "Gast 2: 'Ausgezeichnet, dann nehme ich die Gemüselasagne!'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Der Gast fragt: 'Gibt es hier einen Park?' Welcher Fall folgt auf 'es gibt'?", answer: "Der Akkusativ (der Park -> einen Park).", explanation: "'es gibt' fordert ausnahmslos das Objekt im Akkusativ." },
      { question: "🗣️ [Sprechen] Bestellen Sie im Restaurant ein Getränk mit dem Verb 'nehmen': 'Ich nehme...'", answer: "'Ich nehme bitte einen Apfelsaft / ein Glas Wasser.'", explanation: "Alltägliche Anwendung von 'nehmen' im Akkusativ." },
      { question: "📖 [Lesen & Syntax] Konjugieren Sie: 'Er _____ (wissen) die richtige Antwort.'", answer: "weiß", explanation: "Die 3. Person Singular von 'wissen' hat keine -t Endung: 'er weiß' (wie ich weiß)." },
      { question: "✍️ [Schreiben] Schreiben Sie 2 Sätze über Ihre Stadt mit 'Es gibt einen...' und 'Es gibt ein...'.", answer: "In meiner Stadt gibt es einen großen Bahnhof. Es gibt auch ein schönes Theater.", explanation: "Festigt 'es gibt' mit Maskulinum und Neutrum." }
    ],
    homework: [
      "Lernen Sie die Konjugation von 'wissen' auswendig: ich weiß, du weißt, er weiß, wir wissen, ihr wisst, sie wissen.",
      "Schreiben Sie 3 Restaurantbestellungen mit 'Ich nehme...'."
    ],
    boardNotes: "Besondere Verben im Fokus:\n1. WISSEN (Verhält sich im Singular wie ein Modalverb!):\n   ich weiß, du weißt, er/sie/es weiß (kein -t!), wir wissen, ihr wisst, sie wissen\n2. NEHMEN: ich nehme, du nimmst, er/sie/es nimmt, wir nehmen\n3. ES GIBT + Akkusativ: Es gibt einen Supermarkt (m), ein Café (n), eine Bank (f)"
  },

  praeteritum: {
    thematicKey: "praeteritum",
    topicTitle: "Präteritum im A1: Die Vergangenheitsformen von 'sein' und 'haben' (war & hatte)",
    grammarFocus: "A1-spezifische Eingrenzung des Präteritums auf die Hilfsverben 'war / hatte' (ich war, du warst, er war; ich hatte, du hattest, er hatte)",
    pedagogicalObjective: "Frühere Zustände, Befindlichkeiten und Besitz in der Vergangenheit einfach und korrekt schildern.",
    cefrLevel: "A1",
    cefrScaffoldingNote: "Akademische Niveau-Kalibrierung: Gemäß CEFR A1-Standards wird das Präteritum ausschließlich für die elementaren Hilfs- und Modalverben ('war' und 'hatte') eingeführt. Das narrative Präteritum von Vollverben (ging, sah, schrieb) gehört zum B1/B2-Syllabus, da die mündliche A1-Kommunikation für Handlungen vorrangig das Perfekt nutzt.",
    vocabulary: [
      { word: "ich war / er war", meaning: "I was / he was (Past tense of sein; state/location in past)", pronunciation: "/ɪç vaːɐ̯ / eːɐ̯ vaːɐ̯/", example_sentence: "Gestern war ich den ganzen Tag zu Hause." },
      { word: "wir waren / sie waren", meaning: "We were / they were (Plural forms of war)", pronunciation: "/viːɐ̯ ˈvaːʁən / ziː ˈvaːʁən/", example_sentence: "Wir waren letztes Wochenende in München." },
      { word: "ich hatte / er hatte", meaning: "I had / he had (Past tense of haben; possession/feeling in past)", pronunciation: "/ɪç ˈhatə / eːɐ̯ ˈhatə/", example_sentence: "Ich hatte gestern leider keine Zeit." },
      { word: "früher / damals", meaning: "Earlier / in the past / back then", pronunciation: "/ˈfʁyːɐ̯ / ˈdaːmaːls/", example_sentence: "Früher hatte ich ein kleines Zimmer." }
    ],
    dialogue: [
      "Jonas: 'Wo warst du denn gestern Abend, Felix? Ich habe dich angerufen.'",
      "Felix: 'Hallo Jonas! Ich war leider krank im Bett. Ich hatte hohes Fieber und starke Kopfschmerzen.'",
      "Jonas: 'Oh je, das tut mir leid! Warst du beim Arzt?'",
      "Felix: 'Ja, ich war gestern Vormittag in der Praxis. Heute geht es mir zum Glück schon viel besser.'",
      "Jonas: 'Sehr gut! Hattest du auch die Medizin aus der Apotheke?'",
      "Felix: 'Ja, die hatte ich gleich abgeholt.'"
    ],
    drills: [
      { question: "🎧 [Hörverstehen] Felix sagt: 'Ich hatte hohes Fieber.' Warum verwendet er 'hatte' und nicht 'habe'?", answer: "Weil das Fieber in der Vergangenheit (gestern) lag und jetzt vorbei ist.", explanation: "'hatte' drückt den vergangenen Zustand aus." },
      { question: "🗣️ [Sprechen] Sagen Sie auf Deutsch: 'Gestern war ich müde, aber ich hatte viel zu tun.'", answer: "'Gestern war ich müde, aber ich hatte viel zu tun.'", explanation: "Kombiniert 'war' und 'hatte' in einer flüssigen Begründung." },
      { question: "📖 [Lesen & Syntax] Konjugieren Sie: 'Wo _____ (sein) ihr gestern Nachmittag?'", answer: "wart", explanation: "2. Person Plural von 'sein' im Präteritum lautet 'ihr wart'." },
      { question: "✍️ [Schreiben] Schreiben Sie 2 Sätze über Ihre Kindheit oder die vergangene Woche mit 'war' und 'hatte'.", answer: "Letztes Jahr war ich in Spanien. Ich hatte dort viele Freunde.", explanation: "Präteritum-Anwendung für elementare A1-Schilderungen." }
    ],
    homework: [
      "Schreiben Sie die Formen von 'sein' (war, warst, war, waren, wart, waren) und 'haben' (hatte, hattest, hatte, hatten, hattet, hatten) tabellarisch auf.",
      "Formulieren Sie 3 Sätze darüber, wie Ihr gestriger Tag war (z.B. Das Wetter war schön, ich hatte gute Laune...)."
    ],
    boardNotes: "Präteritum im A1 (NUR 'war' & 'hatte'!):\nIm gesprochenen Deutsch nutzt man für Verben das Perfekt (Ich habe gemacht).\nABER für 'sein' und 'haben' nutzt man im Alltag das Präteritum:\n• SEIN: ich war | du warst | er/sie/es war | wir waren | ihr wart | sie/Sie waren\n• HABEN: ich hatte | du hattest | er/sie/es hatte | wir hatten | ihr hattet | sie/Sie hatten\nBeispiel: Ich war im Kino. Ich hatte keine Zeit."
  }
};

// =============================================================================
// FRENCH THEMATIC RESOLVER (A1 Standards)
// =============================================================================
const FRENCH_THEMATIC_BANK: Record<string, ThematicPedagogicalKit> = {
  numbers: {
    thematicKey: "numbers",
    topicTitle: "Les nombres de 0 à 100, l'âge et les transactions quotidiennes",
    grammarFocus: "Les adjectifs numéraux cardinaux, l'expression de l'âge avec le verbe AVOIR (et non être)",
    pedagogicalObjective: "Compter jusqu'à 100, exprimer son âge, lire les prix et indiquer son numéro de téléphone.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "un, deux, trois", meaning: "Numbers 1, 2, 3", pronunciation: "/œ̃, dø, tʁwa/", example_sentence: "Un, deux, trois cafés pour la table quatre." },
      { word: "dix, vingt, cent", meaning: "Cardinals 10, 20, 100", pronunciation: "/dis, vɛ̃, sɑ̃/", example_sentence: "Ce manuel de français coûte vingt euros." },
      { word: "le numéro de téléphone", meaning: "Phone number", pronunciation: "/lə ny.me.ʁo də te.le.fɔn/", example_sentence: "Quel est votre numéro de téléphone portable ?" },
      { word: "coûter", meaning: "To cost (pricing verb)", pronunciation: "/ku.te/", example_sentence: "Combien coûte cette baguette s'il vous plaît ?" }
    ],
    dialogue: [
      "Boulanger: 'Bonjour monsieur ! Ce sera tout pour aujourd'hui ?'",
      "Client: 'Bonjour ! Je prends deux croissants et une baguette, s'il vous plaît.'",
      "Boulanger: 'Très bien. Cela fait quatre euros cinquante au total.'",
      "Client: 'Voici un billet de dix euros.'",
      "Boulanger: 'Et cinq euros cinquante de monnaie. Merci beaucoup et bonne journée !'"
    ],
    drills: [
      { question: "🎧 [Écoute] Le boulanger annonce : 'Cela fait 14 euros.' Quel nombre avez-vous entendu ?", answer: "quatorze (14)", explanation: "Distinguer quatorze (14) et quarante (40)." },
      { question: "🗣️ [Production orale] Dites votre âge en français en utilisant le verbe avoir.", answer: "Exemple : 'J'ai vingt-quatre ans.'", explanation: "En français, l'âge s'exprime obligatoirement avec 'avoir'." },
      { question: "📖 [Lecture & Syntaxe] Écrivez en lettres le nombre 75 en français standard.", answer: "soixante-quinze", explanation: "Système vigésimal : 60 + 15 = soixante-quinze." },
      { question: "✍️ [Écriture] Rédigez une demande de prix polie pour un livre.", answer: "Combien coûte ce livre de grammaire, s'il vous plaît ?", explanation: "Formule fonctionnelle de transaction." }
    ],
    homework: [
      "Écrivez les nombres de 1 à 30 en toutes lettres dans votre cahier.",
      "Pratiquez la prononciation des dizaines : dix, vingt, trente, quarante, cinquante, soixante."
    ],
    boardNotes: "Les nombres en français :\n• 0 à 16 : formes uniques (un, deux... seize)\n• 17 à 19 : dix-sept, dix-huit, dix-neuf\n• L'âge s'exprime avec AVOIR : J'ai 20 ans (NE PAS DIRE : 'Je suis 20 ans')"
  },

  greetings: {
    thematicKey: "greetings",
    topicTitle: "Les salutations, la politesse et la distinction Tu / Vous",
    grammarFocus: "Registre soutenu (Bonjour Monsieur/Madame, vous de politesse) vs. familier (Salut, tu)",
    pedagogicalObjective: "Choisir le registre d'adresse approprié et saluer courtoisement en contexte francophone.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "Bonjour / Bonsoir", meaning: "Formal daytime greeting / Evening greeting", pronunciation: "/bɔ̃.ʒuʁ / bɔ̃.swaʁ/", example_sentence: "Bonjour Madame Martin, comment allez-vous ?" },
      { word: "Enchanté(e)", meaning: "Pleased to meet you", pronunciation: "/ɑ̃.ʃɑ̃.te/", example_sentence: "Enchanté de faire votre connaissance !" },
      { word: "S'il vous plaît", meaning: "Please (formal polite address)", pronunciation: "/sil vu plɛ/", example_sentence: "Un verre d'eau minérale, s'il vous plaît." },
      { word: "Au revoir", meaning: "Formal goodbye / until we meet again", pronunciation: "/o ʁə.vwaʁ/", example_sentence: "Au revoir et à la semaine prochaine !" }
    ],
    dialogue: [
      "Mme Laurent: 'Bonjour Monsieur Mercier ! Comment allez-vous aujourd'hui ?'",
      "M. Mercier: 'Bonjour Madame Laurent. Je vais très bien, merci beaucoup. Et vous-même ?'",
      "Mme Laurent: 'Très bien, merci. Je vous présente notre nouveau stagiaire, Thomas.'",
      "Thomas: 'Bonjour Madame. Enchanté de vous rencontrer !'"
    ],
    drills: [
      { question: "🎧 [Écoute] Complétez la salutation formelle entendue : 'Comment allez-_____ ?'", answer: "vous", explanation: "'Vous' marque le vouvoiement de respect professionnel." },
      { question: "🗣️ [Production orale] Présentez-vous poliment à votre professeur de français.", answer: "Bonjour Professeur, je m'appelle [Prénom]. Enchanté !", explanation: "Emploi du registre formel adapté au cadre académique." },
      { question: "📖 [Lecture & Syntaxe] Dans quelle situation utilise-t-on 'Salut' : avec un client ou avec un camarade ?", answer: "Avec un camarade ou un ami.", explanation: "'Salut' relève du registre familier et informel." },
      { question: "✍️ [Écriture] Écrivez la formule de politesse pour demander poliment l'addition au serveur.", answer: "L'addition, s'il vous plaît, Monsieur.", explanation: "Usage de 's'il vous plaît' en situation quotidienne." }
    ],
    homework: [
      "Créez un tableau comparatif avec deux colonnes : 'Tu (familier)' et 'Vous (formel)'.",
      "Écrivez un court dialogue de 4 répliques entre deux personnes qui se rencontrent pour la première fois."
    ],
    boardNotes: "Salutations & Politesse :\n• Formel (clients, inconnus, aînés) : Bonjour Monsieur/Madame | Comment allez-vous ? | Au revoir\n• Informel (amis, famille, enfants) : Salut ! | Ça va ? | À plus / Ciao\n• Politesse essentielle : S'il vous plaît / Merci beaucoup"
  }
};

// =============================================================================
// SPANISH THEMATIC RESOLVER (A1 Standards)
// =============================================================================
const SPANISH_THEMATIC_BANK: Record<string, ThematicPedagogicalKit> = {
  numbers: {
    thematicKey: "numbers",
    topicTitle: "Los números del 0 al 100, la edad y las transacciones cotidianas",
    grammarFocus: "Numerales cardinales, expresión de la edad con el verbo TENER (y no ser/estar)",
    pedagogicalObjective: "Contar hasta 100, expresar la edad propia, preguntar precios e intercambiar teléfonos.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "uno, dos, tres", meaning: "Numbers 1, 2, 3", pronunciation: "/ˈu.no, dos, tɾes/", example_sentence: "Uno, dos, tres cafés con leche para la mesa." },
      { word: "diez, veinte, cien", meaning: "Cardinals 10, 20, 100", pronunciation: "/djeθ, ˈbejn.te, θjen/", example_sentence: "El billete de tren cuesta veinte euros." },
      { word: "el número de teléfono", meaning: "Telephone number", pronunciation: "/el ˈnu.me.ɾo ðe teˈle.fo.no/", example_sentence: "¿Cuál es tu número de teléfono móvil?" },
      { word: "costar (cuesta)", meaning: "To cost (pricing verb)", pronunciation: "/kosˈtaɾ (ˈkwes.ta)/", example_sentence: "¿Cuánto cuesta esta camiseta roja?" }
    ],
    dialogue: [
      "Camarero: '¡Buenos días! ¿Qué van a tomar?'",
      "Cliente: 'Hola, buenos días. Queremos dos zumos de naranja y un bocadillo, por favor.'",
      "Camarero: 'Muy bien. Son seis euros con cincuenta céntimos en total.'",
      "Cliente: 'Aquí tiene diez euros.'",
      "Camarero: 'Y tres euros con cincuenta de cambio. ¡Que disfrute de su desayuno!'"
    ],
    drills: [
      { question: "🎧 [Audición] El dependiente dice: 'Cuesta veinticinco euros.' ¿Qué número ha dicho?", answer: "veinticinco (25)", explanation: "Los números del 21 al 29 se escriben en una sola palabra con 'i' latina." },
      { question: "🗣️ [Expresión oral] Diga su edad en español usando el verbo tener.", answer: "Ejemplo: 'Tengo veintidós años.'", explanation: "En español se usa obligatoriamente el verbo TENER para la edad." },
      { question: "📖 [Lectura & Sintaxis] ¿Cuál es la forma correcta: 'treinta y cuatro' o 'treintaycuatro'?", answer: "treinta y cuatro", explanation: "A partir del 31 los números compuestos se separan con la conjunción 'y'." },
      { question: "✍️ [Escritura] Escriba una frase preguntando el precio de un billete de autobús.", answer: "¿Cuánto cuesta un billete de autobús, por favor?", explanation: "Estructura interrogativa estándar para transacciones." }
    ],
    homework: [
      "Escriba los números del 1 al 30 en su cuaderno prestando atención a la ortografía de los veintes.",
      "Practique deletrear los números de teléfono de tres amigos en español."
    ],
    boardNotes: "Números en español:\n• 1 al 15: una palabra (uno, dos... quince)\n• 16 al 19: dieciséis, diecisiete, dieciocho, diecinueve\n• 21 al 29: una sola palabra con 'i' (veintiuno, veintidós...)\n• 31 en adelante: separados con 'y' (treinta y uno, cuarenta y dos)\n• Para la edad se usa TENER: 'Tengo 20 años' (NUNCA: 'Soy 20 años')"
  },

  greetings: {
    thematicKey: "greetings",
    topicTitle: "Saludos, despedidas y fórmulas de cortesía (Tú vs. Usted)",
    grammarFocus: "Distinción de registro: 'tú' (informal) vs. 'usted' (formal con verbo en 3ª persona)",
    pedagogicalObjective: "Saludar cordialmente según el momento del día y elegir el pronombre de trato adecuado.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "¡Hola! / ¡Buenos días!", meaning: "Hello / Good morning (standard greetings)", pronunciation: "/ˈo.la / ˈbwe.nos ˈdi.as/", example_sentence: "¡Buenos días, señor López! ¿Cómo está usted?" },
      { word: "¿Cómo estás? / ¿Cómo está?", meaning: "How are you? (Informal tú / Formal usted)", pronunciation: "/ˈko.mo esˈtas / ˈko.mo esˈta/", example_sentence: "Hola Carlos, ¿cómo estás hoy?" },
      { word: "Mucho gusto / Encantado", meaning: "Pleased to meet you", pronunciation: "/ˈmu.tʃo ˈɣus.to / eŋ.kanˈta.ðo/", example_sentence: "Mucho gusto en conocerte, soy Elena." },
      { word: "Por favor / Gracias", meaning: "Please / Thank you (politeness formulas)", pronunciation: "/poɾ faˈβoɾ / ˈɡɾa.θjas/", example_sentence: "Una mesa para dos, por favor. – Muchas gracias." }
    ],
    dialogue: [
      "Sra. García: '¡Buenos días, doctor Sánchez! ¿Cómo está usted?'",
      "Dr. Sánchez: 'Buenos días, señora García. Muy bien, gracias. ¿Y usted?'",
      "Sra. García: 'Bien, gracias. Le presento a mi sobrino Pablo.'",
      "Pablo: 'Mucho gusto en conocerle, doctor.'",
      "Dr. Sánchez: 'El gusto es mío, Pablo. Bienvenido.'"
    ],
    drills: [
      { question: "🎧 [Audición] En un contexto laboral con un nuevo director, ¿qué fórmula utiliza: '¿Cómo estás?' o '¿Cómo está usted?'?", answer: "¿Cómo está usted?", explanation: "El pronombre 'usted' marca la distancia profesional y el respeto formal." },
      { question: "🗣️ [Expresión oral] Salude a un compañero de clase de manera informal.", answer: "¡Hola! ¿Qué tal? ¿Cómo estás?", explanation: "Registro coloquial adecuado entre estudiantes." },
      { question: "📖 [Lectura & Sintaxis] Complete con la forma verbal adecuada: 'Usted _____ (ser) muy amable.'", answer: "es", explanation: "'Usted' concuerda gramaticalmente con la 3ª persona del singular." },
      { question: "✍️ [Escritura] Escriba una despedida formal para un correo electrónico.", answer: "Atentamente, [Su Nombre].", explanation: "Fórmula habitual de cierre profesional." }
    ],
    homework: [
      "Haga un esquema con los saludos para: la mañana (buenos días), la tarde (buenas tardes) y la noche (buenas noches).",
      "Redacte un diálogo de presentación entre dos jóvenes en una fiesta."
    ],
    boardNotes: "Saludos & Fórmulas de Cortesía:\n• Saludos por horario: Buenos días (mañana) | Buenas tardes (tarde) | Buenas noches (noche)\n• Tú vs. Usted:\n  - Tú: ¿Cómo estás? | ¿Cómo te llamas?\n  - Usted: ¿Cómo está? | ¿Cómo se llama? (con verbo en 3ª persona)"
  }
};

// =============================================================================
// JAPANESE THEMATIC RESOLVER (JLPT N5 / A1 Standards)
// =============================================================================
const JAPANESE_THEMATIC_BANK: Record<string, ThematicPedagogicalKit> = {
  numbers: {
    thematicKey: "numbers",
    topicTitle: "数字 (Numbers 1-100), 年齢 and Everyday Counters",
    grammarFocus: "Sino-Japanese cardinal numbers (ichi, ni, san), counter suffixes (sai for age, en for yen), and telephone number reading with 'no'",
    pedagogicalObjective: "Count fluently up to 100, state your age using '-sai', ask prices with 'ikura', and give contact numbers.",
    cefrLevel: "A1 (JLPT N5)",
    vocabulary: [
      { word: "一、二、三 (ichi, ni, san)", meaning: "Numbers 1, 2, 3", pronunciation: "/i.tɕi, ɲi, saɴ/", example_sentence: "一つ、二つ、三つのりんごがあります。(There are 1, 2, 3 apples.)" },
      { word: "十、百、千 (juu, hyaku, sen)", meaning: "Tens, hundreds, thousands (10, 100, 1000)", pronunciation: "/dʑɯː, ça.kɯ, seɴ/", example_sentence: "この本は五百円です。(This book is 500 yen.)" },
      { word: "～歳 (sai)", meaning: "Age counter suffix (nan-sai desu ka: How old are you?)", pronunciation: "/sai/", example_sentence: "私は二十歳です。(I am twenty years old.)" },
      { word: "いくら (ikura)", meaning: "How much (price inquiry interrogative)", pronunciation: "/i.kɯ.ɾa/", example_sentence: "これはいくらですか。(How much is this?)" }
    ],
    dialogue: [
      "店員 (Clerk): 'いらっしゃいませ！(Welcome!)'",
      "客 (Customer): 'すみません、この傘はいくらですか。(Excuse me, how much is this umbrella?)'",
      "店員 (Clerk): 'それは千二百円です。(That is 1,200 yen.)'",
      "客 (Customer): 'じゃ、これをください。(Well then, I will take this please.)'"
    ],
    drills: [
      { question: "🎧 [Listening Discrimination] The clerk says: 'sanbyaku gojuu en'. What is the price in numbers?", answer: "350 yen (三百五十円)", explanation: "sanbyaku (300) + gojuu (50) en." },
      { question: "🗣️ [Speaking] State your telephone number in Japanese using the linking particle 'no' between blocks.", answer: "Example: 'Zero-hachi-zero no, ichi-ni-san-yon no, go-roku-nana-hachi desu.'", explanation: "The particle 'no' acts as the hyphen between number clusters." },
      { question: "📖 [Reading & Syntax] How is the number 20 read when referring to age in Japanese?", answer: "Hatachi (二十歳)", explanation: "Special irregular cultural reading for 20 years old (coming of age)." },
      { question: "✍️ [Writing] Write the question: 'How much is this?' in Hiragana.", answer: "これはいくらですか。(Kore wa ikura desu ka.)", explanation: "Core purchasing phrase in Japanese commerce." }
    ],
    homework: [
      "Write cardinal numbers from 1 to 20 in Kanji and Hiragana.",
      "Memorize the sound changes for hundreds: sanbyaku (300), roppyaku (600), happyaku (800)."
    ],
    boardNotes: "Japanese Numbers & Counters:\n• 1 to 10: ichi, ni, san, yon/shi, go, roku, nana/shichi, hachi, kyuu, juu\n• Special Age: 20 years old = 'hatachi' (NOT ni-juu-sai)\n• Price inquiry: [Item] wa ikura desu ka."
  },

  greetings: {
    thematicKey: "greetings",
    topicTitle: "挨拶 (Greetings), 自己紹介 (Self-Introduction) and Politeness (Desu / Masu)",
    grammarFocus: "Topic marker particle は (pronounced 'wa'), polite copula です (desu), and bow etiquette",
    pedagogicalObjective: "Greet people appropriately throughout the day and deliver a polished self-introduction.",
    cefrLevel: "A1 (JLPT N5)",
    vocabulary: [
      { word: "おはようございます / こんにちは", meaning: "Good morning (polite) / Good afternoon (Hello)", pronunciation: "/o.ha.joː ɡo.za.i.ma.sɯ / koɴ.ɲi.tɕi.wa/", example_sentence: "先生、おはようございます。(Good morning, teacher.)" },
      { word: "初めまして (hajimemashite)", meaning: "Nice to meet you (introduction starter)", pronunciation: "/ha.dʑi.me.ma.ɕi.te/", example_sentence: "初めまして、田中です。(Nice to meet you, I am Tanaka.)" },
      { word: "どうぞよろしく (douzo yoroshiku)", meaning: "Please treat me favorably (closing introduction formula)", pronunciation: "/doː.zo jo.ɾo.ɕi.kɯ/", example_sentence: "どうぞよろしくお願いします。(Please treat me well.)" },
      { word: "ありがとうございます", meaning: "Thank you very much (polite gratitude)", pronunciation: "/a.ɾi.ɡa.toː ɡo.za.i.ma.sɯ/", example_sentence: "ご親切にありがとうございます。(Thank you very much for your kindness.)" }
    ],
    dialogue: [
      "田中 (Tanaka): '初めまして。田中健一です。(Nice to meet you. I am Kenichi Tanaka.)'",
      "スミス (Smith): '初めまして。ジョン・スミスです。アメリカから来ました。(Nice to meet you. I am John Smith. I came from America.)'",
      "田中 (Tanaka): 'スミスさん、どうぞよろしくお願いします。(Mr. Smith, pleased to meet you.)'",
      "スミス (Smith): 'こちらこそ、よろしくお願いします。(Likewise, pleased to meet you.)'"
    ],
    drills: [
      { question: "🎧 [Listening] What is the polite response when someone says: 'Douzo yoroshiku onegai shimasu'?", answer: "'Kochira koso, yoroshiku onegai shimasu.' (Likewise, please treat me well.)", explanation: "'Kochira koso' acknowledges and reciprocates the politeness." },
      { question: "🗣️ [Speaking] Introduce yourself with name, nationality, and the polite closing.", answer: "'Hajimemashite. Watashi wa [Name] desu. [Country] kara kimashita. Douzo yoroshiku onegai shimasu.'", explanation: "Standard natural Japanese self-introduction pattern." },
      { question: "📖 [Reading & Syntax] How is the topic marker particle は read in 'Watashi wa'?", answer: "Read as 'wa' (not 'ha').", explanation: "When は functions as the grammatical topic marker, its pronunciation shifts from 'ha' to 'wa'." },
      { question: "✍️ [Writing] Write the greeting used in the morning in Hiragana.", answer: "おはようございます (ohayou gozaimasu)", explanation: "Polite morning greeting." }
    ],
    homework: [
      "Practice bowing at a 15-degree angle while delivering your 3-line self-introduction aloud.",
      "Write the Hiragana characters for: Konnichiwa, Arigatou, Sayounara."
    ],
    boardNotes: "Daily Japanese Greetings:\n• Morning: おはようございます (Ohayou gozaimasu)\n• Afternoon: こんにちは (Konnichiwa)\n• Evening: こんばんは (Konbanwa)\n• Topic Pattern: [Person] は [Name/Attribute] です。(wa = topic marker, desu = copula)"
  }
};

// =============================================================================
// KOREAN THEMATIC RESOLVER (TOPIK 1 / A1 Standards)
// =============================================================================
const KOREAN_THEMATIC_BANK: Record<string, ThematicPedagogicalKit> = {
  numbers: {
    thematicKey: "numbers",
    topicTitle: "숫자 (Numbers): Sino-Korean vs. Native Korean and Counters",
    grammarFocus: "Dual number system: Sino-Korean (il, i, sam for dates, money, phone) vs. Native Korean (hana, dul, set for hours, counting objects)",
    pedagogicalObjective: "Accurately apply Sino-Korean numbers for prices and phone numbers, and Native numbers for age and items.",
    cefrLevel: "A1 (TOPIK 1)",
    vocabulary: [
      { word: "일, 이, 삼 (Sino-Korean)", meaning: "Numbers 1, 2, 3 (for money, dates, minutes, phone numbers)", pronunciation: "/il, i, sam/", example_sentence: "이 책은 삼천 원이에요. (This book is 3,000 won.)" },
      { word: "하나, 둘, 셋 (Native Korean)", meaning: "Numbers 1, 2, 3 (for hours, counting people, items)", pronunciation: "/ha.na, dul, set/", example_sentence: "커피 두 잔 주세요. (Please give me two cups of coffee.)" },
      { word: "얼마예요? (Eolmayeyo?)", meaning: "How much is it? (price question)", pronunciation: "/ʌl.ma.je.jo/", example_sentence: "이 사과 얼마예요? (How much is this apple?)" },
      { word: "전화번호 (Jeonhwabeonho)", meaning: "Telephone number", pronunciation: "/tɕʌn.hwa.bʌn.ho/", example_sentence: "전화번호가 몇 번이에요? (What is your phone number?)" }
    ],
    dialogue: [
      "손님 (Customer): '사장님, 이 티셔츠 얼마예요? (Owner, how much is this T-shirt?)'",
      "가게 주인 (Shopkeeper): '만 오천 원이에요. (It is 15,000 won.)'",
      "손님 (Customer): '이 티셔츠 한 장 주세요. (Please give me one of these T-shirts.)'",
      "가게 주인 (Shopkeeper): '네, 여기 있습니다. 감사합니다! (Yes, here it is. Thank you!)'"
    ],
    drills: [
      { question: "🎧 [Listening] The clerk says: 'Man won-ieyo.' How much is that?", answer: "10,000 won (만원)", explanation: "'Man' denotes the 10,000 unit in the Korean numbering system." },
      { question: "🗣️ [Speaking] Order two cups of coffee politely in Korean: 'Keopi...'", answer: "'Keopi du jan juseyo.' (커피 두 잔 주세요.)", explanation: "Uses Native Korean number 'dul' contracted to 'du' before the counter 'jan' (cups)." },
      { question: "📖 [Reading & Syntax] Which number system is used for telling minutes: Sino-Korean or Native Korean?", answer: "Sino-Korean (il, i, sam... bun)", explanation: "Hours use Native Korean (du si = 2 o'clock), but minutes use Sino-Korean (samsip bun = 30 minutes)." },
      { question: "✍️ [Writing] Write 'How much is it?' in Hangul.", answer: "얼마예요? (Eolmayeyo?)", explanation: "Essential daily transaction phrase." }
    ],
    homework: [
      "Memorize Sino-Korean numbers from 1 to 10: il, i, sam, sa, o, yuk, chil, pal, gu, sip.",
      "Write down the prices of three items in your bag in Korean Won."
    ],
    boardNotes: "Korean Dual Number System:\n• Sino-Korean: il, i, sam, sa, o, yuk, chil, pal, gu, sip (Used for: Money, Dates, Minutes, Phone)\n• Native Korean: hana, dul, set, net, daseot (Used for: Hours, Counting objects, Age)\n• Counter words: -gae (things), -myeong (people), -jan (cups)"
  },

  greetings: {
    thematicKey: "greetings",
    topicTitle: "인사말 (Greetings), 자기소개 (Self-Introduction) and Politeness (Imnida / Ieyo)",
    grammarFocus: "Formal polite ending -ㅂ니다/습니다 (-mnida/-seumnida) vs. informal polite -이에요/예요 (-ieyo/-yeyo), topic markers 은/는",
    pedagogicalObjective: "Greet people with proper bowing honorifics and state your name and nationality clearly.",
    cefrLevel: "A1 (TOPIK 1)",
    vocabulary: [
      { word: "안녕하세요 (Annyeonghaseyo)", meaning: "Hello / Good day (standard respectful greeting)", pronunciation: "/an.njʌŋ.ha.se.jo/", example_sentence: "선생님, 안녕하세요! (Hello, teacher!)" },
      { word: "감사합니다 / 고맙습니다", meaning: "Thank you (polite gratitude)", pronunciation: "/kam.sa.ham.ni.da / ko.map.sɯm.ni.da/", example_sentence: "도와주셔서 감사합니다. (Thank you for helping me.)" },
      { word: "처음 뵙겠습니다", meaning: "Pleased to meet you for the first time", pronunciation: "/tɕʰʌ.ɯm boep.k͈et.sɯm.ni.da/", example_sentence: "처음 뵙겠습니다. 저는 민수입니다. (Pleased to meet you. I am Minsu.)" },
      { word: "안녕히 계세요 / 안녕히 가세요", meaning: "Goodbye (to one staying / to one leaving)", pronunciation: "/an.njʌŋ.hi kje.se.jo / an.njʌŋ.hi ka.se.jo/", example_sentence: "안녕히 가세요! 다음에 또 봐요. (Goodbye [go well]! See you next time.)" }
    ],
    dialogue: [
      "민수 (Minsu): '안녕하세요? 저는 김민수입니다. (Hello? I am Kim Minsu.)'",
      "사라 (Sarah): '안녕하세요? 처음 뵙겠습니다. 저는 사라입니다. (Hello? Nice to meet you. I am Sarah.)'",
      "민수 (Minsu): '사라 씨는 어느 나라 사람이에요? (Sarah, which country person are you?)'",
      "사라 (Sarah): '저는 캐나ダ 사람이에요. 한국어를 공부해요. (I am Canadian. I study Korean.)'"
    ],
    drills: [
      { question: "🎧 [Listening] If you are leaving a friend's house while the host stays home, which goodbye do you say?", answer: "'Annyeonghi gyeseyo' (안녕히 계세요 - 'Stay in peace')", explanation: "'Gyeseyo' is said to the person staying; 'Gaseyo' is said to the person leaving." },
      { question: "🗣️ [Speaking] Deliver a 3-sentence self-introduction stating your name, nationality, and pleasure to meet.", answer: "'Annyeonghaseyo? Jeoneun [Name] imnida. [Country] saram-ieyo. Mannaseo bangapsumnida.'", explanation: "Standard polite beginner self-introduction in Korea." },
      { question: "📖 [Reading & Syntax] When attaching the topic marker to 'Jeo' (I), do you use 'eun' or 'neun'?", answer: "'neun' (저는 - Jeoneun)", explanation: "'neun' attaches to stems ending in a vowel; 'eun' attaches to stems ending in a final consonant (batchim)." },
      { question: "✍️ [Writing] Write 'Thank you' in formal polite Hangul.", answer: "감사합니다 (Gamsahamnida)", explanation: "Standard formal gratitude formula." }
    ],
    homework: [
      "Practice writing the 14 basic Hangul consonants and 10 basic vowels.",
      "Record yourself delivering a 20-second self-introduction in Korean."
    ],
    boardNotes: "Korean Politeness & Introductions:\n• Standard Greeting: 안녕하세요 (Annyeonghaseyo)\n• Self-Introduction Formula: 저는 [Name] 입니다. [Country] 사람이에요.\n• Topic Markers: 은 (after consonant) / 는 (after vowel)"
  }
};

// =============================================================================
// ENGLISH THEMATIC RESOLVER (A1 Standards)
// =============================================================================
const ENGLISH_THEMATIC_BANK: Record<string, ThematicPedagogicalKit> = {
  numbers: {
    thematicKey: "numbers",
    topicTitle: "Numbers 0 to 100, Quantities, Prices, and Contact Details",
    grammarFocus: "Cardinal numbers (0-100), expressing age with the verb 'to be' (NOT to have!), and price inquiries with 'How much'",
    pedagogicalObjective: "Count fluently up to 100, exchange telephone numbers, ask prices, and state your age accurately.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "one, two, three", meaning: "Numbers 1, 2, 3", pronunciation: "/wʌn, tuː, θriː/", example_sentence: "I would like one tea and two coffees, please." },
      { word: "ten, twenty, hundred", meaning: "Cardinals 10, 20, 100", pronunciation: "/tɛn, ˈtwɛnti, ˈhʌndrəd/", example_sentence: "The ticket costs twenty-five pounds." },
      { word: "telephone number", meaning: "Phone contact digits", pronunciation: "/ˈtɛlɪfoʊn ˈnʌmbər/", example_sentence: "What is your telephone number? – It is 07911 123456." },
      { word: "cost (How much is...?)", meaning: "Price inquiry formula", pronunciation: "/kɒst/", example_sentence: "How much does this English dictionary cost?" }
    ],
    dialogue: [
      "Cashier: 'Good morning! That will be eighteen pounds fifty, please.'",
      "Customer: 'Good morning! Here is a twenty-pound note.'",
      "Cashier: 'Thank you very much. And here is your change: one pound fifty. Would you like a receipt?'",
      "Customer: 'No thank you, that is fine. Have a great day!'"
    ],
    drills: [
      { question: "🎧 [Listening] The cashier says: 'The bill is £43.' What number did you hear?", answer: "forty-three (43)", explanation: "Listen for the stress on forty (FOR-ty) vs. fourteen (four-TEEN)." },
      { question: "🗣️ [Speaking] State your age clearly in English using the correct verb.", answer: "Example: 'I am twenty-five years old.' (or 'I am twenty-five.')", explanation: "In English, age uses the verb 'TO BE' (I am), NEVER 'to have'." },
      { question: "📖 [Reading & Syntax] Which sentence is grammatically correct: 'I have 20 years' or 'I am 20 years old'?", answer: "'I am 20 years old.'", explanation: "First-language interference error: English uses 'to be' for age." },
      { question: "✍️ [Writing] Write out the number 87 in English words.", answer: "eighty-seven", explanation: "Hyphenate compound numbers between twenty-one and ninety-nine." }
    ],
    homework: [
      "Write out cardinal numbers from 1 to 30 in your notebook, paying attention to 'thirteen' and 'thirty'.",
      "Dictate three phone numbers aloud in English."
    ],
    boardNotes: "Numbers & Age in English:\n• 13-19 end in '-teen' with stress on the suffix (four-TEEN)\n• 20-90 end in '-ty' with stress on the first syllable (FOR-ty)\n• AGE: Always use 'TO BE' -> I am 22 years old (NEVER: I have 22 years)"
  },

  greetings: {
    thematicKey: "greetings",
    topicTitle: "Greetings, Formal & Informal Salutations, and Politeness Markers",
    grammarFocus: "Distinguishing formal greetings (Good morning, Pleased to meet you) from casual salutations (Hi, How are you doing?)",
    pedagogicalObjective: "Select appropriate registers for salutations and open everyday conversations with polite etiquette.",
    cefrLevel: "A1",
    vocabulary: [
      { word: "Good morning / Hello", meaning: "Formal morning salutation / Universal greeting", pronunciation: "/ɡʊd ˈmɔːrnɪŋ / hɛˈloʊ/", example_sentence: "Good morning, Professor Higgins! How are you today?" },
      { word: "Pleased to meet you", meaning: "Polite formal introduction formula", pronunciation: "/pliːzd tuː miːt juː/", example_sentence: "I am David Miller. – Pleased to meet you, David." },
      { word: "Please / Thank you", meaning: "Essential politeness markers in English culture", pronunciation: "/pliːz / θæŋk juː/", example_sentence: "Could you please open the window? Thank you very much." },
      { word: "Goodbye / See you later", meaning: "Formal farewell / Casual farewell", pronunciation: "/ɡʊdˈbaɪ / siː juː ˈleɪtər/", example_sentence: "Goodbye everyone, see you next Monday!" }
    ],
    dialogue: [
      "Ms. Clark: 'Good morning, Mr. Evans! How are you doing today?'",
      "Mr. Evans: 'Good morning, Ms. Clark! I am doing very well, thank you. And how are you?'",
      "Ms. Clark: 'I am great, thank you. May I introduce our new colleague, Michael?'",
      "Michael: 'Pleased to meet you, Mr. Evans. I look forward to working with you.'"
    ],
    drills: [
      { question: "🎧 [Listening] In a formal business setting, which greeting is expected: 'Hey what's up' or 'Good afternoon'?", answer: "'Good afternoon' (or 'Good morning / Good evening').", explanation: "Maintains professional etiquette and polite register." },
      { question: "🗣️ [Speaking] Introduce yourself politely to your teacher on the first day of class.", answer: "'Good morning Teacher. My name is [Name]. It is a pleasure to meet you.'", explanation: "Standard classroom politeness." },
      { question: "📖 [Reading & Syntax] How should you respond if someone says: 'Thank you very much'?", answer: "'You are very welcome!'", explanation: "Standard courteous conversational return." },
      { question: "✍️ [Writing] Write a polite one-line request for a glass of water.", answer: "Could I please have a glass of water? / A glass of water, please.", explanation: "Using 'please' softens direct requests." }
    ],
    homework: [
      "List the 3 polite time-based greetings: Good morning (until 12:00), Good afternoon (12:00-18:00), Good evening (after 18:00).",
      "Write a short 4-line introductory dialogue between two international students."
    ],
    boardNotes: "English Greetings & Etiquette:\n• Morning: Good morning (before 12 PM)\n• Afternoon: Good afternoon (12 PM to ~6 PM)\n• Evening: Good evening (after 6 PM) [Note: 'Good night' is ONLY said when going to sleep or leaving!]\n• Politeness: Always add 'please' and 'thank you'."
  }
};

// =============================================================================
// RESOLVER ENGINE: INTENT & THEME MATCHER
// =============================================================================

function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[_\-\/\.\,\:\;\(\)\[\]\{\}\'\"\#\*\!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves the pedagogical kit from the thematic dictionary.
 * Strictly checks linguistic intents across German, French, Spanish, Japanese, Korean, English.
 */
export function resolveThematicPedagogicalKit(
  language: string,
  level: string,
  rawTopicTitle: string,
  dayNumber: number
): ThematicPedagogicalKit | null {
  const lang = (language || "german").toLowerCase().trim();
  const normalized = normalizeText(rawTopicTitle);

  // ---------------------------------------------------------------------------
  // 1. GERMAN TOPIC MATCHER
  // ---------------------------------------------------------------------------
  if (lang.includes("german") || lang.includes("deutsch")) {
    // Check specific German themes (resilient to common typos like Perfkt, Pretaritum, Trenbare, etc.)
    if (/\b(ordinal[a-z]*|ordnungszahl[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.ordinal_numbers;
    }
    if (/\b(number[a-z]*|zahl[a-z]*|kardinalzahl[a-z]*|z[aä]hl[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.numbers;
    }
    if (/\b(vocab[a-z]*|wortschatz[a-z]*|grundwortschatz[a-z]*|a1[-_ ]?vocab[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.vocabulary;
    }
    if (/\b(greet[a-z]*|begr[uü][sß][a-z]*|vorstell[a-z]*|hallo|salutation[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.greetings;
    }
    if (/\b(untre[n]+b[aäe]?r[a-z]*|inseparable)/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.untrennbare_verben;
    }
    if (/\b(tre[n]+b[aäe]?r[a-z]*|separable)/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.trennbare_verben;
    }
    if (/\b(modal[a-z]*|modalverb[a-z]*|k[oö]nnen|m[uü]ssen|wollen|m[oö]chten|d[uü]rfen)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.modal_verben;
    }
    if (/\b(w[-_ ]?frag[a-z]*|fragew[oö]rt[a-z]*|interrogativ[a-z]*|question words?)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.w_fragen;
    }
    if (/\b(ja[-_ /]?nein|satzfrage[a-z]*|inversion[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.ja_nein_fragen;
    }
    if (/\b(pr[aäe]p[a-z]*|preposition[a-z]*|wechselpr[aä]position[a-z]*|dativ[-_ ]?akkusativ)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.praepositionen;
    }
    if (/\b(perf[eé]?kt[a-z]*|partizip ii|past tense|vergangenheit)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.perfekt;
    }
    if (/\b(imperat[a-z]*|befehl[a-z]*|aufforderung[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.imperativ;
    }
    if (/\b(connect[a-z]*|konnektor[a-z]*|satzverbind[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.konnektoren;
    }
    if (/\b(uhrzeit[a-z]*|clock time|offiziel[a-z]*|inoffiziel[a-z]*|wie sp[aä]t)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.uhrzeit;
    }
    if (/\b(zeitangab[a-z]*|time expression[a-z]*|tage|wochentag[a-z]*|tageszeit[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.zeitangaben;
    }
    if (/\b(adjektiv[a-z]*|adjective[a-z]*|gegens[aä]tz[a-z]*|antonym[a-z]*)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.adjektive;
    }
    if (/\b(besond[a-z]*|unregelm[a-z]*|special verbs?|wissen|nehmen)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.besondere_verben;
    }
    if (/\b(pr[aäe]t[aäe]?rit[a-z]*|simple past|imperfekt|war und hatte|war|hatte)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.praeteritum;
    }
    if (/\b(cas(e|es)|kasus|nominativ|akkusativ|dativ|artikel|articles?)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.kasus_cases;
    }
    if (/\b(verb[a-z]*|konjug[a-z]*|conjugat[a-z]*|pr[aä]sens)\b/i.test(normalized)) {
      return GERMAN_THEMATIC_BANK.verben_konjugation;
    }
  }

  // ---------------------------------------------------------------------------
  // 2. FRENCH TOPIC MATCHER
  // ---------------------------------------------------------------------------
  if (lang.includes("french") || lang.includes("fran")) {
    if (/\b(nombre|nombres|chiffre|cardinaux|age|compter)\b/.test(normalized)) {
      return FRENCH_THEMATIC_BANK.numbers;
    }
    if (/\b(salut|salutation|salutations|bonjour|politesse|tu vs vous)\b/.test(normalized)) {
      return FRENCH_THEMATIC_BANK.greetings;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. SPANISH TOPIC MATCHER
  // ---------------------------------------------------------------------------
  if (lang.includes("spanish") || lang.includes("espa")) {
    if (/\b(n[uú]mero|n[uú]meros|contar|edad|precios)\b/.test(normalized)) {
      return SPANISH_THEMATIC_BANK.numbers;
    }
    if (/\b(saludo|saludos|despedida|despedidas|cortes[ií]a|hola|t[uú] vs usted)\b/.test(normalized)) {
      return SPANISH_THEMATIC_BANK.greetings;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. JAPANESE TOPIC MATCHER
  // ---------------------------------------------------------------------------
  if (lang.includes("japan") || lang.includes("nihon")) {
    if (/\b(number|numbers|suuji|counter|counters|age|ikura|price)\b/.test(normalized)) {
      return JAPANESE_THEMATIC_BANK.numbers;
    }
    if (/\b(greet|greetings|aisatsu|introduction|hajimemashite|desu|polite)\b/.test(normalized)) {
      return JAPANESE_THEMATIC_BANK.greetings;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. KOREAN TOPIC MATCHER
  // ---------------------------------------------------------------------------
  if (lang.includes("korean") || lang.includes("hangul")) {
    if (/\b(number|numbers|sino|native|counter|counters|sutja|price|age)\b/.test(normalized)) {
      return KOREAN_THEMATIC_BANK.numbers;
    }
    if (/\b(greet|greetings|annyeong|insa|introduction|imnida|ieyo|polite)\b/.test(normalized)) {
      return KOREAN_THEMATIC_BANK.greetings;
    }
  }

  // ---------------------------------------------------------------------------
  // 6. ENGLISH TOPIC MATCHER
  // ---------------------------------------------------------------------------
  if (lang.includes("english")) {
    if (/\b(number|numbers|cardinal|counting|age|price|contact)\b/.test(normalized)) {
      return ENGLISH_THEMATIC_BANK.numbers;
    }
    if (/\b(greet|greetings|salutation|hello|politeness|introduction)\b/.test(normalized)) {
      return ENGLISH_THEMATIC_BANK.greetings;
    }
  }

  return null;
}

/**
 * Checks an individual token (single word or number) for linguistic authenticity
 */
function isSingleValidWordToken(token: string, language: string = "german"): boolean {
  if (!token || typeof token !== "string") return false;
  const t = token.trim();
  if (t.length === 1) return /[aeiouyäöüà0-9]/i.test(t);
  if (t.length < 2 || t.length > 35) return false;

  // Reject web and technical tokens
  const techPattern = /^(https?|www|com|netlify|app|google|youtube|html|php|aspx|utm_|sa|ved|opi|usg|caes|uoh|url|link|href|src|post|posts|shorts)$/i;
  if (techPattern.test(t)) return false;

  // Reject internal random camelCase or uppercase inside word (e.g. tFcH, zgxOdmX, AebXcjF)
  if (/[a-z][A-Z]/.test(t)) return false;

  // For Asian languages, allow CJK / Hangul
  const isAsianLang = /japan|korean|chinese|hangul|nihon/i.test(language);
  if (isAsianLang) {
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(t)) {
      return true;
    }
  }

  // Allow numbers or time format like 14:30 or 2:30 or 0
  if (/^(\d{1,4}(:\d{2})?|\d{1,4})$/.test(t)) return true;

  const lower = t.toLowerCase();
  const vowels = lower.match(/[aeiouyäöüéèêëàâîïôùûñáíóúß]/g);
  if (!vowels || vowels.length === 0) return false;

  // Words with length >= 8 must have at least 2 vowels unless starting with known German clusters like sch/str
  if (t.length >= 8 && vowels.length < 2 && !/^(sch|str|spr)/i.test(t)) return false;

  // Reject impossible consonant + x / q / j collisions (e.g. gx, xod, dmx, xc, cjf, zq)
  if (/[bcdfghjklmnprstvwz][xq]|[xq][bcdfghjklmnprstvwz]|jf|zq|qj|xj|jx|gx|dx|mx|bx|px|fx|vx|wx|cx/i.test(lower)) {
    return false;
  }

  return true;
}

/**
 * Validates whether a token or phrase is a legitimate human linguistic vocabulary item
 * Rejects hex strings, base64 fragments, URL queries (Tfch, Zgxodmx, Aebxcjf, Bdz, etc.)
 */
export function isValidLinguisticWord(word: string, language: string = "german"): boolean {
  if (!word || typeof word !== "string") return false;
  const w = word.trim();
  if (!w) return false;

  // If word contains phrase separators (spaces, slashes, punctuation, brackets)
  const tokens = w.replace(/[()\/,\->?!\.:;+]/g, ' ').split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  return tokens.every(tok => isSingleValidWordToken(tok, language));
}

/**
 * Sanitizes input text before any tokenization or word extraction
 * Completely strips URLs, query parameters, tracking parameters, hashes, and file extensions
 */
export function sanitizeSourceTextForVocabulary(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Strip full URLs (http, https, netlify, share.google, etc.)
    .replace(/https?:\/\/[^\s]+/gi, " ")
    .replace(/[a-zA-Z0-9-]+\.(?:netlify\.app|com|org|edu|de|io|ai|app|co|be)[^\s]*/gi, " ")
    // Strip URL query parameters and hashes (&sa=t, &url=CAES..., ?si=...)
    .replace(/(\?|&)[a-zA-Z0-9_=-]+/gi, " ")
    .replace(/CAES[A-Za-z0-9_-]+/gi, " ")
    .replace(/%[0-9A-Fa-f]{2}/gi, " ")
    // Strip common file extensions
    .replace(/\.(docx|doc|pdf|txt|pptx|xlsx|csv|zip)\b/gi, " ")
    // Strip noise labels
    .replace(/_FINAL_V\d+|_V\d+|\(1\)|\(\d+\)/gi, " ")
    .replace(/\[Tutor Upload[^\]]*\]/gi, " ")
    .replace(/\[YouTube[^\]]*\]/gi, " ")
    // Normalize spaces
    .replace(/\s+/g, " ")
    .trim();
}
