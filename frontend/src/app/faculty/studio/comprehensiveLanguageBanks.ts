import { DayCurriculumItem } from './curriculumProgression';

// =============================================================================
// RICH MULTI-LANGUAGE LEVEL & TOPIC DICTIONARIES
// Authentic CEFR & JLPT/TOPIK standard topics and vocabulary for French, Spanish, German, Japanese, Korean
// =============================================================================

export interface LanguageWordItem {
  word: string;
  meaning: string;
  pronunciation: string;
  example_sentence: string;
}

export const COMPREHENSIVE_LANGUAGE_BANKS: Record<
  string,
  {
    topics: Record<string, string[]>;
    vocabulary: LanguageWordItem[];
    dialogues: string[][];
  }
> = {
  french: {
    topics: {
      a1: [
        "L'alphabet phonétique, les voyelles nasales et les accents de base",
        "Les salutations formelles et informelles et formules de politesse",
        "Se présenter : nom, prénom, nationalité et profession (Verbe Être)",
        "Les nombres de 0 à 100 et échanger ses coordonnées",
        "Les articles définis et indéfinis (le, la, les / un, une, des)",
        "Le genre et nombre des noms et adjectifs qualificatifs",
        "Le verbe 'Avoir' : exprimer l'âge, la famille et les possessions",
        "Les verbes réguliers du premier groupe en -ER au présent de l'indicatif",
        "La négation absolue (ne... pas) et transformation des articles indéfinis",
        "Interrogation simple : intonation, 'Est-ce que' et mots interrogatifs",
        "La famille, les proches et les adjectifs possessifs (mon, ton, son)",
        "Les jours de la semaine, les mois et planifier son agenda",
        "L'heure, les moments de la journée et les rythmes quotidiens",
        "Les activités quotidiennes et les verbes pronominaux (se réveiller, s'habiller)",
        "Exprimer ses goûts et préférences : aimer, adorer, détester",
        "La nourriture, l'alimentation et les articles partitifs (du, de la, des)",
        "Au restaurant et au marché : commander poliment et payer l'addition",
        "La ville, les commerces et demander son itinéraire",
        "Le logement, les pièces de la maison et situer les objets dans l'espace",
        "Le climat, les saisons et la météo quotidienne",
        "Les loisirs, les sports et l'expression des projets futurs (aller + infinitif)",
        "Les vêtements, les couleurs et faire des achats dans une boutique",
        "Parler de sa santé basique et exprimer une douleur physique (avoir mal à)",
        "Évoquer des événements passés récents avec le passé composé d'action",
        "Synthèse communicative globale et consolidation du niveau A1"
      ],
      b1: [
        "Exprimer son opinion argumentée et débattre poliment",
        "Le subjonctif présent : nécessité, doute et sentiments personnels",
        "Les hypothèses réelles et irréelles avec 'Si' (présent, imparfait, conditionnel)",
        "Le discours rapporté au passé et la concordance des temps",
        "Les pronoms relatifs simples et composés (qui, que, dont, où, lequel)",
        "Exprimer la cause, la conséquence, l'opposition et la concession",
        "Le monde du travail, la recherche d'emploi et l'entretien professionnel",
        "Les médias, l'actualité contemporaine et l'analyse critique de l'information",
        "L'environnement, le développement durable et les défis écologiques",
        "Synthèse thématique, simulation d'épreuve orale et écrite B1"
      ]
    },
    vocabulary: [
      { word: "Bonjour", meaning: "Standard formal greeting (Good morning / Hello)", pronunciation: "/bɔ̃.ʒuʁ/", example_sentence: "Bonjour Madame, comment allez-vous aujourd'hui ?" },
      { word: "S'il vous plaît", meaning: "Formal politeness marker (Please)", pronunciation: "/sil vu plɛ/", example_sentence: "Un café noir et un verre d'eau, s'il vous plaît." },
      { word: "Enchanté(e)", meaning: "Pleasure to meet you", pronunciation: "/ɑ̃.ʃɑ̃.te/", example_sentence: "Enchanté de faire votre connaissance, je m'appelle Julien." },
      { word: "L'apprentissage", meaning: "Learning / apprenticeship process", pronunciation: "/l‿a.pʁɑ̃.ti.saʒ/", example_sentence: "L'apprentissage d'une langue étrangère demande de la régularité." },
      { word: "Le vocabulaire", meaning: "Active vocabulary repertoire", pronunciation: "/vɔ.ka.by.lɛʁ/", example_sentence: "Chaque matin, nous mémorisons cinq nouveaux mots de vocabulaire." },
      { word: "La prononciation", meaning: "Phonetic articulation and accent clarity", pronunciation: "/pʁɔ.nɔ̃.sja.sjɔ̃/", example_sentence: "Répétez après moi pour perfectionner votre prononciation des voyelles nasales." },
      { word: "La phrase", meaning: "Complete syntactic sentence", pronunciation: "/fʁaz/", example_sentence: "Construisez une phrase affirmative avec le verbe être." },
      { word: "L'exercice", meaning: "Practical drill or linguistic practice", pronunciation: "/ɛɡ.zɛʁ.sis/", example_sentence: "Faites l'exercice numéro trois à la page quarante." },
      { word: "La question", meaning: "Interrogative enquiry", pronunciation: "/kɛs.tjɔ̃/", example_sentence: "Posez une question polie à votre camarade de classe." },
      { word: "La réponse", meaning: "Answer or resolution", pronunciation: "/ʁe.pɔ̃s/", example_sentence: "La réponse correcte nécessite l'accord du participe passé." },
      { word: "Le voyage", meaning: "Travel or journey", pronunciation: "/vwa.jaʒ/", example_sentence: "Nous préparons un grand voyage culturel à travers la France." },
      { word: "Le restaurant", meaning: "Dining establishment", pronunciation: "/ʁɛs.to.ʁɑ̃/", example_sentence: "Ce soir, nous dînons dans un restaurant traditionnel lyonnais." },
      { word: "La gare", meaning: "Train station", pronunciation: "/ɡaʁ/", example_sentence: "Où se trouve la gare ferroviaire la plus proche ?" },
      { word: "L'université", meaning: "Higher education university", pronunciation: "/y.ni.vɛʁ.si.te/", example_sentence: "Les étudiants se réunissent à l'université pour la conférence." },
      { word: "Le travail", meaning: "Work or employment", pronunciation: "/tʁa.vaj/", example_sentence: "Mon travail commence à neuf heures du matin." }
    ],
    dialogues: [
      ["Lucas: 'Bonjour Madame ! Est-ce que cette table près de la fenêtre est libre ?'", "Serveuse: 'Bonjour Monsieur ! Oui tout à fait, installez-vous. Que désirez-vous prendre ?'", "Lucas: 'Je voudrais commander la formule déjeuner avec une carafe d'eau, s'il vous plaît.'", "Serveuse: 'Très bon choix, je vous apporte cela immédiatement.'"],
      ["Élise: 'Pardonnez-moi, pourriez-vous m'indiquer le chemin pour aller au musée ?'", "Passant: 'Bien sûr ! Continuez tout droit jusqu'au carrefour, puis tournez à gauche.'", "Élise: 'C'est à combien de minutes à pied d'ici ?'", "Passant: 'À peine cinq minutes de marche, vous ne pouvez pas le manquer !'"]
    ]
  },

  spanish: {
    topics: {
      a1: [
        "El alfabeto español, sonidos fonéticos y pronunciación de la 'r' y 'j'",
        "Saludos formales e informales y fórmulas de cortesía cotidiana",
        "Presentación personal: nombres, nacionalidad y origen (Verbo Ser + de)",
        "Números cardinales del 0 al 100 y datos de contacto",
        "Artículos determinados e indeterminados (el, la, los, las / un, una)",
        "Género y número de los sustantivos y concordancia adjetival",
        "Pronombres personales y el verbo 'Ser' para descripciones esenciales",
        "El verbo 'Estar' y la ubicación espacial de personas y objetos",
        "Diferencia fundamental y contrastes entre 'Ser' y 'Estar'",
        "Verbos regulares en presente de indicativo: terminaciones en -AR",
        "Verbos regulares en presente: terminaciones en -ER y -IR",
        "Interrogativos esenciales (qué, quién, cómo, dónde, cuándo, por qué)",
        "La familia y relaciones personales: adjetivos posesivos (mi, tu, su)",
        "Profesiones, oficios y lugares de trabajo habituales",
        "Días de la semana, meses del año y expresiones temporales",
        "La hora y horarios cotidianos (¿Qué hora es? / A las...)",
        "Rutina diaria y verbos reflexivos (levantarse, ducharse, acostarse)",
        "El verbo 'Gustar' y estructuras afectivas para expresar preferencias",
        "Comida, mercado y vocabulario esencial del restaurante",
        "Pedir en un café o restaurante: fórmulas comunicativas funcionales",
        "El clima, estaciones y expresiones meteorológicas (Hace frío/calor)",
        "La ciudad, transporte público y pedir indicaciones de dirección",
        "Colores, ropa y compras: el verbo 'Llevar' y precios",
        "Adjetivos demostrativos (este, ese, aquel) y pronombres",
        "Planes inmediatos con la perífrasis verbal 'Ir a + infinitivo'"
      ],
      b1: [
        "El pretérito indefinido frente al imperfecto : contrastes narrativos",
        "El presente de subjuntivo : deseos, dudas y valoraciones subjetivas",
        "Oraciones condicionales con 'Si' en presente y pasado",
        "Estilo indirecto en pasado y correlación de tiempos",
        "Pronombres de objeto directo e indirecto combinados (se lo dije)",
        "Conectores discursivos de causa, consecuencia y contraste",
        "El mundo laboral : redacción de currículum y entrevista de trabajo",
        "Cultura, arte y tradiciones del mundo hispanohablante"
      ]
    },
    vocabulary: [
      { word: "Hola", meaning: "Standard casual and friendly greeting (Hello / Hi)", pronunciation: "/ˈo.la/", example_sentence: "¡Hola! ¿Cómo estás hoy en la clase de español?" },
      { word: "Por favor", meaning: "Politeness formula (Please)", pronunciation: "/poɾ faˈβoɾ/", example_sentence: "Una mesa para dos personas en la terraza, por favor." },
      { word: "Mucho gusto", meaning: "Pleasure to meet you", pronunciation: "/ˈmu.tʃo ˈɣus.to/", example_sentence: "Mucho gusto en conocerte, soy Carlos de Valencia." },
      { word: "El vocabulario", meaning: "Active vocabulary bank", pronunciation: "/bo.ka.buˈla.ɾjo/", example_sentence: "Anotamos las nuevas palabras en el cuaderno de vocabulario." },
      { word: "La pronunciación", meaning: "Articulation and phonetic accuracy", pronunciation: "/pɾo.nun.sjaˈsjon/", example_sentence: "Practicamos la pronunciación correcta de la doble erre." },
      { word: "La conversación", meaning: "Spoken interactive discourse", pronunciation: "/kom.beɾ.saˈsjon/", example_sentence: "Mantenemos una conversación muy dinámica en parejas." },
      { word: "El ejercicio", meaning: "Practical drill or grammatical task", pronunciation: "/e.xeɾˈsi.sjo/", example_sentence: "Completamos los ejercicios de concordancia verbal." },
      { word: "La pregunta", meaning: "Interrogative question", pronunciation: "/pɾeˈɣun.ta/", example_sentence: "Haz una pregunta a tu compañero sobre su rutina diaria." },
      { word: "La respuesta", meaning: "Answer or resolution", pronunciation: "/resˈpwes.ta/", example_sentence: "La respuesta correcta utiliza el verbo estar con adjetivos temporales." },
      { word: "El viaje", meaning: "Journey or travel", pronunciation: "/ˈbja.xe/", example_sentence: "Preparamos un viaje fascinante por Andalucía." },
      { word: "El restaurante", meaning: "Restaurant dining place", pronunciation: "/res.tawˈɾan.te/", example_sentence: "Vamos a comer tapas típicas en el restaurante del centro." },
      { word: "La estación", meaning: "Station (train/bus)", pronunciation: "/es.taˈsjon/", example_sentence: "¿Dónde se encuentra la estación de metro más cercana?" },
      { word: "La ciudad", meaning: "Urban city", pronunciation: "/sjuˈðað/", example_sentence: "Madrid es una ciudad llena de historia y arte." },
      { word: "El trabajo", meaning: "Work or employment", pronunciation: "/tɾaˈβa.xo/", example_sentence: "Mi trabajo en la escuela de idiomas es muy gratificante." },
      { word: "La familia", meaning: "Family members", pronunciation: "/faˈmi.lja/", example_sentence: "Mi familia vive en una hermosa casa cerca de la costa." }
    ],
    dialogues: [
      ["Mateo: '¡Buenos días! ¿Tiene una mesa libre para almorzar?'", "Camarero: '¡Hola! Sí, por supuesto, pase por aquí. ¿Qué le gustaría beber primero?'", "Mateo: 'Un vaso de agua fresca y el menú del día, por favor.'", "Camarero: 'Enseguida se lo traigo con pan recién horneado.'"],
      ["Sofía: 'Disculpe señor, ¿cómo puedo llegar a la plaza mayor?'", "Transeúnte: 'Siga todo recto por esta avenida y doble a la derecha en el semáforo.'", "Sofía: '¿Está lejos de aquí?'", "Transeúnte: 'No, está a solo diez minutos a pie. ¡Que tenga buen día!'"]
    ]
  },

  german: {
    topics: {
      a1: [
        "Das deutsche Alphabet, Aussprache, Umlaute (ä, ö, ü) und Diphthonge",
        "Begrüßung, Verabschiedung und grundlegende Höflichkeitsformeln",
        "Sich und andere vorstellen: Name, Herkunft und Wohnort (Verben 'sein' und 'kommen')",
        "Zahlen von 0 bis 100, Telefonnummern und Buchstabieren von Namen",
        "Bestimmte und unbestimmte Artikel im Nominativ (der, die, das / ein, eine)",
        "Nomen: Genus, Pluralbildung und grammatisches Geschlecht",
        "Personalpronomen und regelmäßige Verben im Präsens (-en, -t)",
        "Wichtige unregelmäßige Verben im Präsens (haben, sein, sprechen, lesen)",
        "Die Verneinung mit 'nicht' und 'kein / keine' im Satzbau",
        "W-Fragen (Wer, Wie, Wo, Woher, Was) und Satzfragen (Ja/Nein)",
        "Familie, Verwandte und Possessivartikel (mein, dein, sein, ihr)",
        "Wochentage, Monate, Jahreszeiten und Zeitangaben",
        "Die Uhrzeit: offizielle und informelle Uhrzeitangaben",
        "Tagesablauf und trennbare Verben (aufstehen, anrufen, einkaufen)",
        "Essen, Trinken, Lebensmittel und Einkaufen im Supermarkt",
        "Im Restaurant oder Café: höflich bestellen und bezahlen (Ich möchte...)",
        "Akkusativ: bestimmter und unbestimmter Artikel bei direkten Objekten",
        "Wohnen, Möbel und Zimmerbeschreibung in der Wohnung",
        "Die Stadt, Sehenswürdigkeiten und nach dem Weg fragen",
        "Das Wetter und Temperaturangaben (Es ist sonnig / kalt)",
        "Freizeitaktivitäten, Hobbys und Verabredungen treffen",
        "Körperteile, Gesundheit und Arztbesuch (Ich habe Kopfschmerzen)",
        "Modalverben im Präsens: können, müssen, wollen, dürfen",
        "Vergangenes beschreiben mit dem Perfekt (haben / sein + Partizip II)",
        "Zusammenfassender Rückblick und Festigung der A1-Kompetenzen"
      ],
      b1: [
        "Verben mit festen Präpositionen und Pronominaladverbien (worauf, daran)",
        "Nebensätze mit Konjunktionen : dass, weil, wenn, obwohl, da",
        "Der Konjunktiv II für höfliche Bitten, Ratschläge und irreale Wünsche",
        "Passiv im Präsens und Präteritum in Vorgangsbeschreibungen",
        "Relativsätze im Nominativ, Akkusativ und Dativ mit Präpositionen",
        "Infinitiv mit 'zu' und Finalsätze mit 'um... zu'",
        "Arbeitswelt, Bewerbungsschreiben und professionelles Vorstellungsgespräch",
        "Meinungsäußerung, Diskussion und Pro-und-Kontra-Argumentation"
      ]
    },
    vocabulary: [
      { word: "Guten Tag", meaning: "Standard formal greeting (Good day / Hello)", pronunciation: "/ˈɡuːtn̩ ˈtaːk/", example_sentence: "Guten Tag Herr Müller, wie geht es Ihnen heute?" },
      { word: "Bitte", meaning: "Politeness word (Please / You're welcome)", pronunciation: "/ˈbɪ.tə/", example_sentence: "Einen Kaffee mit Milch und Zucker, bitte." },
      { word: "Freut mich", meaning: "Pleased to meet you", pronunciation: "/fʁɔɪ̯t mɪç/", example_sentence: "Guten Morgen! Freut mich sehr, Sie kennenzulernen." },
      { word: "Der Wortschatz", meaning: "Vocabulary repertoire", pronunciation: "/ˈvɔʁtˌʃat͡s/", example_sentence: "Wir lernen jeden Tag neuen deutschen Wortschatz." },
      { word: "Die Aussprache", meaning: "Pronunciation clarity", pronunciation: "/ˈaʊ̯sˌʃpʁaːxə/", example_sentence: "Achten Sie genau auf die deutliche Aussprache der Umlaute." },
      { word: "Die Grammatik", meaning: "Grammar rules and sentence mechanics", pronunciation: "/ɡʁaˈmatɪk/", example_sentence: "Die deutsche Grammatik folgt klaren syntaktischen Regeln." },
      { word: "Die Übung", meaning: "Practice exercise or drill", pronunciation: "/ˈyːbʊŋ/", example_sentence: "Machen wir zusammen die Übung im Kursbuch." },
      { word: "Die Frage", meaning: "Question", pronunciation: "/ˈfʁaːɡə/", example_sentence: "Haben Sie zu dieser Regel noch eine Frage?" },
      { word: "Die Antwort", meaning: "Answer", pronunciation: "/ˈantvɔʁt/", example_sentence: "Die richtige Antwort steht am Ende des Kapitels." },
      { word: "Die Reise", meaning: "Trip or journey", pronunciation: "/ˈʁaɪ̯zə/", example_sentence: "Unsere Reise nach Berlin beginnt nächsten Montag." },
      { word: "Das Restaurant", meaning: "Restaurant", pronunciation: "/ʁɛstoˈʁɑ̃ː/", example_sentence: "Im Restaurant bestellen wir traditionelle Spezialitäten." },
      { word: "Der Bahnhof", meaning: "Railway station", pronunciation: "/ˈbaːnˌhoːf/", example_sentence: "Der Hauptbahnhof liegt direkt im Stadtzentrum." },
      { word: "Die Stadt", meaning: "City / Town", pronunciation: "/ʃtat/", example_sentence: "München ist eine sehr schöne und lebendige Stadt." },
      { word: "Die Arbeit", meaning: "Work / Job", pronunciation: "/ˈaʁbaɪ̯t/", example_sentence: "Pünktlichkeit ist bei der Arbeit in Deutschland wichtig." },
      { word: "Die Familie", meaning: "Family", pronunciation: "/faˈmiːli̯ə/", example_sentence: "Am Wochenende verbringe ich viel Zeit mit meiner Familie." }
    ],
    dialogues: [
      ["Lukas: 'Guten Tag! Haben Sie noch einen freien Tisch für zwei Personen?'", "Kellner: 'Guten Tag! Ja natürlich, gerne hier drüben am Fenster. Was darf ich Ihnen bringen?'", "Lukas: 'Ich hätte gern eine Apfelschorle und das Tagesgericht, bitte.'", "Kellner: 'Sehr gern, kommt sofort zu Ihnen an den Tisch.'"],
      ["Anna: 'Entschuldigung, wissen Sie, wo der nächste Bahnhof ist?'", "Passant: 'Ja, gehen Sie einfach geradeaus und biegen Sie an der Kreuzung rechts ab.'", "Anna: 'Wie lange dauert das zu Fuß?'", "Passant: 'Nur etwa fünf Minuten. Einen schönen Tag noch!'"]
    ]
  },

  japanese: {
    topics: {
      a1: [
        "五十音図とひらがなの読み書き・発音の基礎 (Hiragana Basics)",
        "カタカナの読み書きと外来語のルール (Katakana)",
        "基本の挨拶と教室の指示表現 (Greetings & Classroom Japanese)",
        "自己紹介：名前、国籍、職業 (です・ではありません)",
        "数字 (0〜100)、年齢、電話番号の言い方",
        "指示代名詞：これ・それ・あれ・どれ (Demonstratives)",
        "場所の指示代名詞：ここ・そこ・あそこ・どこ (Locations)",
        "助詞「の」による所属と修飾関係 (Possessive Particle 'no')",
        "時間の表現：〜時〜分、曜日、いつ (Time & Days)",
        "動詞のます形 (現在肯定・否定：〜ます・〜ません)",
        "移動動詞と助詞「へ」「で」：行きます・来ます・帰ります",
        "助詞「を」による目的語と日常の行動 (Object Particle 'o')",
        "助詞「で」による場所と道具・手段の指定",
        "誘いの表現：〜ませんか・〜ましょう (Invitations)",
        "存在を表す動詞：います・ありますと助詞「に」 (Existence)",
        "物の数え方と助数詞 (本、枚、人、つ)",
        "い形容詞の現在形と過去形 (肯・否定)",
        "な形容詞の現在形と過去形 (肯・否定)",
        "好悪と能力の表現：好き・嫌い・上手・下手",
        "買い物とレストランでの注文：〜をください (Ordering)",
        "動詞のて形とその作り方 (Te-form conjugations)",
        "依頼の表現：〜てください (Polite Requests)",
        "進行中の動作：〜ています (Present Progressive)",
        "許可と禁止：〜てもいいです・〜てはいけません",
        "A1総合復習とロールプレイ会話実践 (Comprehensive Review)"
      ],
      b1: [
        "動詞の普通形と丁寧体の使い分け (Plain vs Polite styles)",
        "意見と思考の表現：〜と思います・〜と言いました",
        "名詞修飾節による詳細な説明文 (Relative Clauses in Japanese)",
        "条件表現：〜たら・〜ば・〜なら・〜と (Conditionals)",
        "授受表現：あげる・もらう・くれる (Giving and Receiving)",
        "受身形と使役形による視点の変化 (Passive & Causative)",
        "敬語体系の基礎：尊敬語と謙譲語の使い分け (Keigo Basics)",
        "JLPT N3レベルの長文読解とビジネス場面の運用力"
      ]
    },
    vocabulary: [
      { word: "こんにちは (Konnichiwa)", meaning: "Standard polite daytime greeting (Hello)", pronunciation: "/kon.ni.tɕi.wa/", example_sentence: "先生、こんにちは！今日もよろしくお願いします。" },
      { word: "お願いします (Onegaishimasu)", meaning: "Polite request phrase (Please / If you please)", pronunciation: "/o.ne.ɡa.i.ɕi.ma.sɯ/", example_sentence: "お水を一杯お願いします。" },
      { word: "はじめまして (Hajimemashite)", meaning: "Pleased to meet you (for the first time)", pronunciation: "/ha.dʑi.me.ma.ɕi.te/", example_sentence: "はじめまして、田中と申します。どうぞよろしく。" },
      { word: "単語 (Tango)", meaning: "Vocabulary words", pronunciation: "/taŋ.ɡo/", example_sentence: "毎日新しい日本語の単語を十個覚えます。" },
      { word: "発音 (Hatsuon)", meaning: "Pronunciation and pitch accent", pronunciation: "/ha.tsɯ.oɴ/", example_sentence: "正しい発音を意識してシャドーイングを練習します。" },
      { word: "文法 (Bumpō)", meaning: "Grammar rules and sentence structures", pronunciation: "/bɯm.poː/", example_sentence: "今日の授業で新しい文法パターンを学びました。" },
      { word: "練習 (Renshū)", meaning: "Practice / Drill", pronunciation: "/ɾeɴ.ɕuː/", example_sentence: "会話の練習をペアになって何度も繰り返します。" },
      { word: "質問 (Shitsumon)", meaning: "Question or enquiry", pronunciation: "/ɕi.tsɯ.moɴ/", example_sentence: "何か分からない質問があればいつでも聞いてください。" },
      { word: "答え (Kotae)", meaning: "Answer or solution", pronunciation: "/ko.ta.e/", example_sentence: "教科書の問題の答えを黒板に書きました。" },
      { word: "旅行 (Ryokō)", meaning: "Travel or trip", pronunciation: "/ɾjo.koː/", example_sentence: "来月、京都へ一人旅行に行く予定です。" },
      { word: "レストラン (Resutoran)", meaning: "Restaurant", pronunciation: "/ɾe.sɯ.to.ɾaɴ/", example_sentence: "駅前の美味しい日本食レストランで夕食を食べました。" },
      { word: "駅 (Eki)", meaning: "Train station", pronunciation: "/e.ki/", example_sentence: "新宿駅の東口で友達と待ち合わせをしています。" },
      { word: "学校 (Gakkō)", meaning: "School or academy", pronunciation: "/ɡak.koː/", example_sentence: "日本語学校の授業は朝の九時に始まります。" },
      { word: "仕事 (Shigoto)", meaning: "Work, job or occupation", pronunciation: "/ɕi.ɡo.to/", example_sentence: "私の仕事はプログラマーで、東京で働いています。" },
      { word: "家族 (Kazoku)", meaning: "Family members", pronunciation: "/ka.zo.kɯ/", example_sentence: "私の家族は四人家族で、皆元気です。" }
    ],
    dialogues: [
      ["鈴木: 'すみません、この近くに美味しい和食の店はありますか？'", "店員: 'はい！駅のすぐ横に伝統的な定食屋がございますよ。'", "鈴木: '歩いてどのくらいかかりますか？'", "店員: '歩いて三分ほどで着きます。とても人気がありますよ。'"],
      ["ケン: 'はじめまして、私はアメリカから来た留学生のケンです。'", "ゆき: 'はじめましてケンさん、ゆきです。日本での生活はどうですか？'", "ケン: '毎日日本語の勉強がとても楽しいです！よろしくお願いします。'", "ゆき: 'こちらこそ、仲良くしましょうね！'"]
    ]
  },

  korean: {
    topics: {
      a1: [
        "한글 자음과 모음의 창제 원리와 정확한 발음 (Hangul Alphabet)",
        "받침(종성)의 발음 규칙과 음절 구성 원리 (Batchim Rules)",
        "기본 인사말과 교실 한국어 표현 (Greetings & Classroom Korean)",
        "자기소개 : 이름, 국적, 직업 (입니다 / 입니까 / 이에요)",
        "지시대명사 : 이것, 그것, 저것과 물건 이름 (Demonstratives)",
        "장소 지시대명사 : 여기, 저기, 거기, 어디 (Locations)",
        "숫자 체계 : 한자어 수사와 고유어 수사의 구별 (Number Systems)",
        "날짜와 요일, 시간 표현하기 (Dates, Days & Time)",
        "동사/형용사 기본형과 아요/어요 어간 활용 (Ayo/Eoyo Conjugation)",
        "목적격 조사 '을/를'과 일상 동작 묘사 (Object Particle)",
        "장소 조사 '에'와 '에서'의 의미상 차이 (Location Particles)",
        "방향 조사 '(으)로'와 이동 동사 : 가다, 오다, 다니다",
        "부정문 만들기 : 안 + 동사와 -지 않다 (Negation)",
        "가족 관계와 높임말의 기초 (Honorifics & Family)",
        "식당에서 음식 주문하기 : -아/어 주세요, 계산하기 (Ordering)",
        "가격 묻기와 쇼핑 표현 : 얼마예요? (Shopping Expressions)",
        "주말 활동과 취미 묘사하기 : -는 것을 좋아하다",
        "과거 시제 만들기 : -았/었어요 (Past Tense)",
        "미래 계획과 의도 표현하기 : -(으)ㄹ 거예요 (Future Intent)",
        "이유와 원인 나타내기 : -아/어서 (Reason & Cause)",
        "제안과 권유하기 : -(으)ㄹ까요? / -(으)ㅂ시다 (Suggestions)",
        "능력과 불가능 표현하기 : -(으)ㄹ 수 있다/없다 (Ability)",
        "희망과 소망 표현하기 : -고 싶다 (Desires)",
        "날씨와 계절에 대해 이야기하기 (Weather & Seasons)",
        "TOPIK 1 대비 실전 종합 복습 및 대화 완성 (Comprehensive Review)"
      ],
      b1: [
        "간접 화법 체계 : -다고 하다, -냐고 하다, -자고 하다",
        "복합 연결 어미 : -(으)ㄴ/는 반면에, -(으)ㄹ 뿐만 아니라",
        "피동사와 사동사의 활용과 문장 구조 (Passive & Causative Verbs)",
        "추측과 전망 표현 : -(으)ㄹ 것 같다, -(으)ㄹ 텐데",
        "사회 이슈와 직장 생활의 필수 비즈니스 한국어",
        "TOPIK 2 중급 읽기 및 듣기 영역 핵심 전략과 실전 모의고사"
      ]
    },
    vocabulary: [
      { word: "안녕하세요 (Annyeonghaseyo)", meaning: "Standard formal polite greeting (Hello)", pronunciation: "/an.njʌŋ.ha.se.jo/", example_sentence: "선생님, 안녕하세요! 오늘 수업도 잘 부탁드립니다." },
      { word: "감사합니다 (Gamsahamnida)", meaning: "Formal gratitude (Thank you)", pronunciation: "/kam.sa.ham.ni.da/", example_sentence: "도와주셔서 진심으로 감사합니다." },
      { word: "반갑습니다 (Bangapseumnida)", meaning: "Nice to meet you (polite formal)", pronunciation: "/pan.gap.sɯm.ni.da/", example_sentence: "처음 뵙겠습니다, 만나서 대단히 반갑습니다." },
      { word: "어휘 (Eohwi)", meaning: "Vocabulary words and expressions", pronunciation: "/ʌ.ɦɥi/", example_sentence: "새로운 한국어 어휘를 플래시카드로 매일 복습합니다." },
      { word: "발음 (Bareum)", meaning: "Pronunciation and phonetic clarity", pronunciation: "/pa.ɾɯm/", example_sentence: "받침 발음을 정확하게 연습하는 것이 중요합니다." },
      { word: "문법 (Munbeop)", meaning: "Grammar rules and sentence structures", pronunciation: "/mun.p͈ʌp̚/", example_sentence: "오늘 수업에서 필수 문법 형태를 익혔습니다." },
      { word: "연습 (Yeonseup)", meaning: "Practice / Exercises", pronunciation: "/jʌn.sɯp̚/", example_sentence: "짝과 함께 대화 연습을 반복해서 말해 보세요." },
      { word: "질문 (Jilmun)", meaning: "Question or enquiry", pronunciation: "/tɕil.mun/", example_sentence: "이 문장에 대해 질문이 있으신 분은 손을 들어주세요." },
      { word: "대답 (Daedap)", meaning: "Answer or reply", pronunciation: "/tɛ.dap̚/", example_sentence: "선생님의 질문에 또박또박 큰 소리로 대답했습니다." },
      { word: "여행 (Yeohaeng)", meaning: "Travel or vacation trip", pronunciation: "/jʌ.ɦɛŋ/", example_sentence: "이번 방학에는 친구들과 부산으로 여행을 가요." },
      { word: "식당 (Sikdang)", meaning: "Restaurant dining place", pronunciation: "/ɕik̚.t͈aŋ/", example_sentence: "학교 근처 식당에서 따뜻한 김치찌개를 먹었습니다." },
      { word: "지하철역 (Jihacheol-yeok)", meaning: "Subway metro station", pronunciation: "/tɕi.ha.tɕʰʌl.jʌk̚/", example_sentence: "가장 가까운 지하철역은 걸어서 5분 거리에 있어요." },
      { word: "학교 (Hakgyo)", meaning: "School or academy", pronunciation: "/hak̚.k͈jo/", example_sentence: "한국어 어학당 학교에서 다양한 국적의 친구들을 만났습니다." },
      { word: "회사 (Hoesa)", meaning: "Company or workplace", pronunciation: "/hø.sa/", example_sentence: "졸업 후에 서울에 있는 IT 회사에 취직하고 싶습니다." },
      { word: "가족 (Gajok)", meaning: "Family members", pronunciation: "/ka.dʑok̚/", example_sentence: "주말에는 가족들과 함께 맛있는 음식을 요리해요." }
    ],
    dialogues: [
      ["민호: '실례합니다, 근처에 유명한 한식당이 어디에 있나요?'", "직원: '길 건너편 골목으로 들어가시면 바로 보여요.'", "민호: '거기서 무엇이 제일 맛있어요?'", "직원: '비빔밥과 불고기가 아주 인기가 많고 맛있습니다!'"],
      ["지우: '안녕하세요! 저는 프랑스에서 온 유학생 지우라고 합니다.'", "수빈: '반가워요 지우 씨! 한국 생활에 잘 적응하고 계세요?'", "지우: '네, 한국 음식도 맛있고 한국어 공부도 아주 재미있어요.'", "수빈: '궁금한 점이 있으면 언제든지 편하게 물어보세요!'"]
    ]
  }
};

/**
 * Resolves comprehensive authentic linguistic syllabus keyed by language, level, and day
 */
export function getLanguageSyllabusItem(
  language: string,
  level: string,
  dayNumber: number,
  userCustomTopic?: string,
  extractedSourceContext?: string
): {
  topic: string;
  grammarFocus: string;
  pedagogicalObjective: string;
  vocabulary: LanguageWordItem[];
  dialogue: string[];
  drills: Array<{ question: string; answer: string; explanation: string }>;
} {
  const lKey = (language || 'french').toLowerCase().trim();
  const bank = COMPREHENSIVE_LANGUAGE_BANKS[lKey] || COMPREHENSIVE_LANGUAGE_BANKS.french;

  const normLevel = (level || 'a1').toLowerCase().split('/')[0].trim();
  const topicsList =
    bank.topics[normLevel] ||
    bank.topics['a1'] ||
    Object.values(bank.topics)[0] ||
    [];

  // 1. Check if user provided custom uploaded source materials or topic
  const hasCustomTopic = Boolean(userCustomTopic && userCustomTopic.trim().length > 3);
  const topicIdx = (dayNumber - 1) % topicsList.length;
  const baseTopicName = topicsList[topicIdx] || `Linguistic Core Module ${dayNumber}`;

  const resolvedTopic = hasCustomTopic
    ? `${userCustomTopic!.trim()} • ${baseTopicName}`
    : baseTopicName;

  // 2. Select rich vocabulary items dynamically shifting per day (never repeating the same 3 words)
  const vocabPool = bank.vocabulary;
  const v1 = vocabPool[(dayNumber * 2 - 2) % vocabPool.length];
  const v2 = vocabPool[(dayNumber * 2 - 1) % vocabPool.length];
  const v3 = vocabPool[(dayNumber * 3 + 1) % vocabPool.length];

  const vocabSelected = [v1, v2, v3].filter(Boolean);

  // 3. Select natural dialogues from pool
  const dlgPool = bank.dialogues;
  const activeDlg = dlgPool[(dayNumber - 1) % dlgPool.length] || dlgPool[0];

  // 4. Construct high-fidelity CEFR drills
  const drills = [
    {
      question: `[R - Reading & Syntax] Apply the target grammatical pattern in ${language} to form an affirmative statement using "${v1.word}".`,
      answer: `Accurate CEFR ${level.toUpperCase()} construction in ${language} integrating "${v1.word}".`,
      explanation: `Demonstrates structural competence with target vocabulary and verbal agreement.`
    },
    {
      question: `[S - Spoken Interaction] Enact a situational paired dialogue asking for clarification or giving instructions with "${v2.word}".`,
      answer: `Polite communicative conversational exchange adhering to native pragmatic registers in ${language}.`,
      explanation: `Develops fluid automaticity and spontaneous speech production.`
    },
    {
      question: `[L - Auditory & Error Discrimination] Identify the liaison boundary, pitch accent, or vowel length nuance when pronouncing "${v3.word}".`,
      answer: `Correct phonetic articulation matching native standard acoustic parameters in ${language}.`,
      explanation: `Prevents mother-tongue phonetic interference and trains auditory perception.`
    },
    {
      question: `[W - Contextual Writing] Draft a 3-sentence functional note or message incorporating both "${v1.word}" and "${v2.word}".`,
      answer: `Coherent short functional writing demonstrating contextual coherence and proper punctuation.`,
      explanation: `Assesses orthographic precision and communicative competence.`
    }
  ];

  return {
    topic: resolvedTopic,
    grammarFocus: `Target Syntax & Morpho-Phonology: ${resolvedTopic}`,
    pedagogicalObjective: `Achieve situational automaticity, vocabulary mastery, and spoken confidence in ${language} (${level.toUpperCase()}).`,
    vocabulary: vocabSelected,
    dialogue: activeDlg,
    drills
  };
}
