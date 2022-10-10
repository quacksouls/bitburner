/**
 * Copyright (C) 2022 Duck McSouls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// A bunch of constant values relating to gangs.

/**
 * Various armour pieces that a gang member can equip.  Going from top to
 * bottom, the armour pieces are listed in order from least expensive to most
 * expensive.  These values are taken from the following page:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const armour = {
    "VEST": "Bulletproof Vest",
    "FULL": "Full Body Armor",
    "LIQUID": "Liquid Body Armor",
    "GRAPHENE": "Graphene Plating Armor"
};

/**
 * All Augmentations that can be equipped on a member of a criminal gang.  The
 * Augmentations are listed from least expensive to most expensive.  The data
 * are taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const gang_augment = {
    "ARMS": "Bionic Arms",
    "LEGS": "Bionic Legs",
    "WEAVE": "Nanofiber Weave",
    "SPINE": "Bionic Spine",
    "MUSCLE": "Synfibril Muscle",
    "BLADES": "BrachiBlades",
    "HEART": "Synthetic Heart",
    "BONE": "Graphene Bone Lacings"
};

/**
 * Constants related to various aspects of our gang members.
 */
export const members = {
    // The maximum number of gang members to assign to Ethical Hacking.
    "EHACK": 1,
    // The number of gangsters we can recruit upon creating our gang.  We must
    // earn more respect to recruit more gang members.
    "INITIAL": 3,
    // The maximum number of members in a gang.  This number is taken from the
    // file:
    //
    // https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/Constants.ts
    "MAX": 12,
    // Various roles for members of our gang.
    "ROLE": {
        "artillery": "Artillery",
        "hacker": "Hacker",
        "medic": "Medic",
        "pilot": "Pilot",
        "punk": "Punk",
        "spy": "Spy",
        "thief": "Thief",
        "traitor": "Traitor",
        "vanguard": "Vanguard",
    },
    // The maximum number of gang members to assign to acts of terrorism.
    // Terrorism greatly increases our respect and wanted level, but generate
    // no income.  We should only have one terrorist.
    "TERRORIST": 1,
    // The maximum number of gang members to assign to Vigilante Justice.
    "VIGILANTE": 3,
    // The maximum number of gang members to assign to territory warfare.  This
    // threshold applies only when we are not engaged in territory warfare
    // against a rival gang.  If we are about to clash against a rival gang, we
    // should devote more members to warfare.  In general, this threshold helps
    // to build our power while we are not engaged in dispute against any rival
    // gang.
    "WARRIOR": 4,
};

/**
 * Miscellaneous constants related to various thresholds.
 */
export const gang_t = {
    // The minimum percentage boost to a stat of a member.  Let x be the
    // ascension multiplier of a member, gained by having ascended one or
    // more times.  Let y be the next ascension multiplier, a boost to x after
    // ascending the member another time.  The value of y is represented as
    // 1.p, where 100 * p is the percentage boost to x.  After the next
    // ascension, the new ascension multiplier of the member would be x * y.
    // We want the value of y to be at least the given threshold.
    "ASCEND": 1.25,
    // The cost or expenditure multiplier.  Equipment and Augmentations for a
    // gang member are expensive.  Whenever we make a decision to purchase a
    // new equipment or Augmentation for a gang member, we multiply the cost of
    // the equipment or Augmentation by this multiplier.  In case we do buy the
    // new equipment, at least we would not have spent all our funds.  Do not
    // want to go bankrupt because we decided to purchase an expensive
    // equipment.
    "COST_MULT": 5,
    // In BitNodes other than BN2.x we must decrease our karma to -54,000 or
    // lower as a pre-requisite for creating a gang.  This constant is taken
    // from the file:
    //
    // https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/Constants.ts
    "KARMA": -54e3,
    // The roster of our gang.  This lists the number of members we want for
    // each role.  Except for punk, we want at most 1 member in each of the
    // other roles.  The number 8 below is the number of members in a non-punk
    // role.
    "ROSTER": {
        "artillery": 1,
        "hacker": 1,
        "medic": 1,
        "pilot": 1,
        "punk": members.MAX - 8,
        "spy": 1,
        "thief": 1,
        "traitor": 1,
        "vanguard": 1,
    },
    // The territory and power of each gang is updated approximately every 20
    // seconds.  We refer to this time period as a tick.
    "TICK": 20e3,
    // The minimum chance of winning a clash against a rival gang.  This chance
    // of victory is expressed as an integer percentage.  In general, we should
    // only engage in turf warfare against another gang if our chance of
    // victory is at least this number.
    "WIN": 60,
};

/**
 * Various types of gangster roles.  A list of names for each role.  We
 * randomly choose a name to assign to a new recruit.  We want our gang to have
 * the following types of members:
 *
 * (1) Artillery.  A gun expert and ranged fighter.  Good with bow and arrows,
 *     or missiles.
 * (2) Hacker.  The computer wizard.
 * (3) Medic.  This is our doctor.
 * (4) Pilot.  Air support from a helicopter, drone, or aeroplane.
 * (5) Punk.  Low level soldiers who rake in money for the gang by committing
 *     various crimes.
 * (6) Spy.  An expert in espionage and reconnaissance.
 * (7) Thief.  Someone who steals treasure.  A sneak.
 * (8) Traitor.  Someone who would likely betray the gang.
 * (9) Vanguard.  Our frontliner and tank.
 */
export const gangster_t = {
    "artillery": [
        // A
        "Alfred Nobel", "Angus MacGyver", "Artemus Gordon",
        // B
        "Bill Dolworth", "Billy Calloway", "Billy Rosewood", "Bobby Jay",
        "Bomb Man", "Bomberman", "Bomb Voyage", "Boris Turgoff", "Burt Gummer",
        // C
        "Carlton Lassiter", "Chaplain Reynolds", "Clay Allison",
        "Colleen Anderson", "Colonel John Casey",
        // D
        "David Thurston", "Demoman", "Dutch",
        // E
        "Edgar K. B. Montrose", "Eugene Tackleberry",
        // F
        "Fatman", "Forte Stollen",
        // G
        "Guy Fawkes",
        // H
        "Hange Zoe", "Harry the Horse", "Hawkeye", "Hawkeye Gough",
        "Hazel D'Ark", "Hero Shackleby", "Holly Summers",
        // I
        "Isao Ota",
        // J
        "Jayne Cobb", "Jean Havoc", "Jessica Clearkin", "John Rambo",
        "John Wick", "Jun the Swan",
        // K
        "Kell Tainer", "Kota Hirano",
        // L
        "Laurie Strode",
        // M
        "Malcolm Reed", "Mark Briscoe", "Marty McChicken", "Maya Jingu",
        "Mike Teevee", "Minene Uryuu",
        // O
        "Ossie Brunt",
        // P
        "Poppy Bros.", "Professor Shikishima", "Private Wilson",
        // R
        "Rally Vincent", "Revy", "Ritsuko Inoue", "Riza Hawkeye",
        "Robin Scherbatsky", "Rocket Raccoon", "Ryo Saeba",
        // S
        "Seras Victoria", "Shino Asada", "Shuri", "Sidney Alford", "Simo Häyhä",
        // T
        "Teddy Bomber", "Tiny Tina",
        // V
        "Vash the Stampede",
        // Y
        "Yoko Littner",
    ],
    "hacker": [
        // A
        "Acid Burn", "Adrian Lamo", "Aelita Schaeffer", "Akira Shirase",
        "Albert Gonzalez", "Anna Grimsdóttír", "Anonymouse", "Apoc", "ASTRA",
        // B
        "Benji Dunn", "Beto O'Rourke", "Boris Grishenko",
        // C
        "Carl Arbogast", "Chihiro Fujisaki", "Chloe O'Brian", "Chuck Bartowski",
        "Crash Override", "Cypher",
        // D
        "Dade Murphy", "Darren Roskow", "David Levinson", "David Lightman",
        "Dennis Nedry", "Dozer",
        // E
        "Edward Snowden", "Edward Wong Hau Pepelu Tivrusky IV",
        "Eugene Belford",
        // F
        "Felicity Smoak",
        // H
        "Henry Dorsett Case", "Hiro Protagonist",
        // I
        "Irwin Emery",
        // J
        "Jeanson James Ancheta", "Jeremy Belpois", "Jobe Smith",
        "Jonathan James",
        // K
        "Kate Libby", "Kevin Flynn", "Kevin Mitnick", "Kevin Poulsen",
        "Kimberley Vanvaeck",
        // L
        "Laughing Man", "Lee Sampson", "Lex Murphy", "Lisbeth Salander",
        "Lord Nikon", "Luther Stickell",
        // M
        "Marshall Flinkman", "Martin Bishop", "Matthew Bevan", "Michael Calce",
        "Milo Hoffman", "Morpheus", "Mouse",
        // N
        "Neo",
        // P
        "Paul Cook", "Penny Brown", "Phantom Phreak",
        // R
        "Rachel Gibson", "Ramόn Sánchez (Phantom Phreak)", "Randy Waterhouse",
        "Richard Pryce", "Riley Poole",
        // S
        "Susan Headley", "Switch",
        // T
        "The Plague", "Trinity",
        // Z
        "Zero Cool",
    ],
    "medic": [
        // A
        "Abascantus", "Adamantius Judaeus", "Aegimus", "Aelius Promotus",
        "Aemilia Hilaria", "Aeschrion of Pergamon", "Aëtius of Amida",
        "Agathinus", "Albucius", "Alexander Fleming",
        "Alexander of Tralles", "al-Zahrawi", "Ambroise Paré", "Amenhotep",
        "Andries van Wesel", "Androcydes", "Andromachus",
        "Anonymus Londinensis", "Antipater", "Antiphanes of Delos",
        "Antonius Castor", "Antyllus", "Apollonius Claudius",
        "Apollonius Cyprius", "Apollonius Organicus", "Apollonius Pergamenus",
        "Apollonius Pitaneus", "Apollonius Senior", "Apollonius Tarensis",
        "Apollonius Ther", "Apollonius Glaucus", "Apollonios of Kition",
        "Archigenes", "Arcyon", "Aretaeus", "Asclepiades of Bithynia",
        "Asclepiades Pharmacion", "Asclepius", "Aspasia the Physician",
        "Athenaeus of Attalia", "Atreya", "Aulus Cornelius Celsus",
        // B
        "Bharadwaja", "Bian Que", "Bogar", "Bolus of Mendes",
        // C
        "Caelius Aurelianus", "Carl Clauberg", "Cassius Felix", "Charaka",
        "Charles R. Drew", "Charmis of Marseilles", "Claudius Philoxenus ",
        "Cosmas and Damian", "Crinas of Marseilles", "Cristina Yang",
        "Criton of Heraclea", "Ctesias of Cnidus",
        // D
        "Daniel Hale Williams", "Demetrius of Apamea",
        "Demosthenes Philalethes", "Derek Shepherd", "Dexippus of Cos",
        "Dieuches", "Diocles of Carystus", "Diomedes of Tarsus", "Dong Feng",
        "Doogie Howser", "Doug Ross", "Dr. Nick",
        // E
        "Edward Jenner", "Elizabeth Blackwell", "Erasistratus", "Eudemus",
        // F
        "Frasier Crane",
        // G
        "Gaius Stertinius Xenophon", "Galen of Pergamon", "George O'Malley",
        "Georges Mathé", "Getafix", "Gregory House",
        // H
        "Hannibal Lecter", "Harold Shipman", "Hawkeye Pierce",
        "Helen B. Taussig", "Heliodorus", "Henry Jekyll",
        "Heraclides of Tarentum", "Herophilos", "H. H. Holmes", "Hicesius",
        "Hippocrates", "Hua Tuo",
        // I
        "Ibn Sina", "Ignaz Semmelweis", "Irynachet",
        // J
        "Jack Kevorkian", "Jack Shephard", "Jackson Avery", "Jane Cooke Wright",
        "Jayant Patel", "Jivaka Komarabhacca", "John Bodkin Adams",
        "John Carter", "John Dolittle", "John Dorian", "John H. Watson",
        "John Snow", "Jonas Salk", "Josef Mengele", "Joseph Lister",
        // K
        "Kashyapa", "Korakkar",
        // L
        "Leonard H. McCoy", "Leoparda", "Lexie Grey", "Linda Burfield Hazzard",
        // M
        "Madhava-kara", "Marcellus Empiricus", "Marcellus of Side",
        "Marcel Petiot", "Mark Sloan", "Meges of Sidon", "Menemachus",
        "Menodotus of Nicomedia", "Meredith Grey", "Metrodora",
        "Michael DeBakey", "Michael Swango", "Michaela Quinn", "Mindy Lahiri",
        "Miranda Bailey", "Mnesitheus", "Morris Bolber",
        // O
        "Oribasius",
        // P
        "Patanjali", "Paracelsus", "Paul of Aegina", "Pedanius Dioscorides",
        "Penthu", "Peseshet", "Philagrius of Epirus", "Philinus of Cos",
        "Philistion of Locri", "Philumenus", "Plistonicus", "Praxagoras of Cos",
        // Q
        "Qar", "Quintus Gargilius Martialis",
        // R
        "Rabâ-ša-Marduk", "Remy Hadley", "Robert Koch", "Rufus of Ephesus",
        // S
        "Saint Fabiola", "Scribonius Largus", "Serapion of Alexandria",
        "Servilius Damocrates", "Sextius Niger", "Sextus Empiricus",
        "Sextus Placitus", "Shennong", "Shepseskaf-ankh", "Soranus of Ephesus",
        // T
        "Themison of Laodicea", "Theodorus Priscianus",
        "Theophilus Protospatharius", "Thessalus of Tralles",
        "Thomas Neill Cream", "Tirumular",
        // V
        "Virginia Apgar",
        // W
        "Walter Freeman", "William Osler",
        // X
        "Xenocrates of Aphrodisias",
        // Z
        "Zhang Zhongjing", "Zopyrus",
    ],
    "pilot": [
        // A
        "Alan Shepard", "Alex Rogan", "Amelia Earhart", "Amuro Ray",
        "Amy Johnson", "Anne Morrow Lindbergh", "Asami Sato",
        // B
        "Baloo", "Beryl Markham", "Bessie Coleman", "Betty Skelton",
        "Bill Owens", "Buzz Aldrin",
        // C
        "Charles Kingsford Smith", "Charles Lindbergh", "Chesley Sullenberger",
        // D
        "Diana Barnato Walker", "Dieter F. Uchtdorf", "Douglas Bader",
        // E
        "Edward O'Hare", "Elliott Roosevelt", "Eugene Bullard",
        // F
        "Fox McCloud", "Francis Gary Powers",
        // G
        "Geraldyn M. Cobb", "Ghost of Kyiv",
        // H
        "Han Solo", "Hanna Reitsch", "Hans Boehm", "Hans von Hammer",
        "Harriet Quimby", "Hera Syndulla", "Hikaru Sulu", "Hoban Washburne",
        "Howard Hughes",
        // I
        "Iceman Kazansky", "Ilan Ramon",
        // J
        "Jacqueline Cochran", "James McCloud", "Jean Batten", "Joe Sullivan",
        "Joker Moreau", "Joseph Cooper",
        // K
        "Kara Thrace",
        // L
        "Lord Flashheart", "Lothar von Richthofen", "Louis Blériot",
        "Lydia Litvyak",
        // M
        "Mamma Aiuto", "Manfred von Richthofen", "Mathias Rust",
        "Maverick Mitchell", "Mitchell Gant",
        // N
        "Nadiya Savchenko", "Night Witches", "Niobe",
        // O
        "Orville Wright",
        // P
        "Pancho Barnes", "Pappy Boyington", "Paul Tibbets", "Piotr Skut",
        "Poe Dameron", "Porco Rosso",
        // R
        "Raymonde de Laroche", "Richard Bong", "Rick Husband",
        // S
        "Sabiha Gökçen", "Slip Stream", "Star Lord", "Steve Fossett",
        "Steven Hiller",
        // T
        "Topper Harley", "Turanga Leela",
        // V
        "Valentina Tereshkova", "Valentina Vostok",
        // W
        "Wolf O'Donnell",
        // Y
        "Yuri Gagarin",
        // Z
        "Xenia Onatopp",
    ],
    "punk": [
        // A
        "Aella", "Ainippe", "Al Capone", "Alfhild", "Al Swearengen", "Alkippe",
        "Andromache", "Anna Nzinga", "Anne Bonny", "Anne Dieu le Veut",
        "Antianeira",
        // B
        "Beatrix Kiddo", "Black Bart", "Blackbeard", "Bonnie Parker",
        "Bryan Mills",
        // C
        "Captain Haddock", "Captain Hook", "Charlotte Badger", "Clyde Barrow",
        // D
        "Deborah Sampson", "Deianira", "Diana Prince", "Donbot", "Don Corleone",
        "Don Logan",
        // E
        "Elise Eskilsdotter", "Ellen Ripley", "Elvira Hancock", "Eowyn",
        "Erza Scarlet", "Evie",
        // F
        "Fat Tony", "Francois l'Olonnais",
        // G
        "Gemma Teller Morrow", "Grace O'Malley",
        // H
        "Harriet Tubman", "Hippolyta", "Hippomache",
        // J
        "Jack Sparrow", "Jacquotte Delahaye", "Jeanne de Clisson", "Jen Yu",
        "Joe Chill", "Jules Winnfield",
        // K
        "Katniss Everdeen", "Kiyuchiyo",
        // L
        "Leon", "Long Ben", "Long John Silver",
        // M
        "Ma Barker", "Ma Beagle", "Mark Gor", "Mary Read", "Melanippe",
        "Mia Wallace", "Mikasa Ackerman",
        // N
        "Nucky Thompson",
        // O
        "O-Ren Ishii",
        // R
        "Rani Velu Nachiyar", "Red Rackham", "Rusla",
        // S
        "Sadie Farrell", "Sayyida al Hurra", "Shiva of the East",
        "Sir Francis Drake", "Sir Henry Morgan", "Snaps Provolone",
        "Stephanie St. Clair", "Stringer Bell",
        // T
        "Tom Stall", "Tony Montana", "Tony Soprano", "Tyler Durden",
        // V
        "Vincent Vega", "Virginia Hill",
        // W
        "William Kidd",
        // Z
        "Zoro Roronoa",
    ],
    "spy": [
        // A
        "Agent 99", "Agent Kay", "Aldrich Ames", "Andree Borrel",
        "Ashraf Marwan", "Austin Millbarge", "Austin Powers",
        // B
        "Belle Boyd", "Bob Ho", "Boris Badenov",
        // C
        "Cody Banks",
        // D
        "Derek Flint", "Donald Maclean",
        // E
        "Eileen Nearne", "Emily Pollifax", "Emma Peel", "Emmett Fitz-Hume",
        "Ethan Hunt", "Ethel Rosenberg",
        // F
        "Felix Leiter", "Francis Walsingham", "Frederick Joubert Duquesne",
        // G
        "George Koval", "George Reginald Starr", "George Smiley",
        "Giacomo Casanova",
        // H
        "Harry Hart", "Harry Tasker", "Herbert Philbrick",
        // I
        "Ian Fleming", "Illya Kuryakin",
        // J
        "Jack Bauer", "Jack Ryan", "James Armistead Lafayette", "James Bond",
        "Jane Blonde", "Jane Smith", "Jason Bourne", "John André", "John Drake",
        "John Steed", "John Vassall", "Johnny English", "Joseph Turner",
        "Julius Rosenberg",
        // K
        "Kim Philby", "Klaus Fuchs", "Krystyna Skarbek",
        // L
        "Lafayette C. Baker",
        // M
        "Markus Wolf", "Mata Hari", "Maxwell Smart", "Michael Westen",
        // N
        "Napoleon Solo", "Natasha Fatale", "Nathan D. Muir", "Noor Inayat Khan",
        // O
        "Odette Hallowes", "Oleg Gordievsky",
        // P
        "Peggy Shippen", "Perry the Platypus",
        // R
        "Ralph McGehee", "Richard Sorge",
        // S
        "Sarah Walker", "Savitri Devi", "Secret Squirrel", "Severus Snape",
        "Shi Pei Pu", "Simon Templar", "Sterling Archer", "Sydney Bristow",
        // T
        "Tara King", "Tom Bishop",
        // V
        "Violette Szabo", "Virginia Hall",
        // W
        "William Brandt", "William Stephenson",
        // X
        "Xander Cage",
        // Y
        "Yelena Belova", "Yisrael Bar",
    ],
    "thief": [
        // A
        "Adam Worth", "Alan Golder", "Albert Spaggiari",
        // B
        "Belle Starr", "Bender Bending Rodríguez", "Bill Mason",
        "Butch Cassidy",
        // C
        "Carl Gugasian", "Carmen Sandiego", "Catwoman", "Charles Peace",
        "Colton Harris-Moore",
        // D
        "Danny Ocean", "David Brankle", "Derek Creighton Smalls",
        "Dinner Set Gang", "Doris Marie Payne",
        // F
        "Fagin", "Forty Elephants Gang", "Francois Villon",
        "Frank Abagnale, Jr.",
        // H
        "Hans Gruber",
        // I
        "Irene Adler", "Ishikawa Goemon",
        // J
        "Jackie Brown", "Jeanne de Valois-Saint-Remy", "Jesse James",
        "Jesse Woodson James", "John Herbert Dillinger", "Jonathan Wild",
        // K
        "Kenny Kimes", "Keyser Söze", "Koose Munisamy Veerappan",
        // L
        "Lara Croft", "Lester Joseph Gillis",
        // M
        "Mary Frith", "Mithilesh Kumar Srivastava",
        // N
        "Neal Caffrey", "Neil McCauley",
        // P
        "Prometheus",
        // R
        "Richard Turpin", "Robert LeRoy Parker", "Robin Hood",
        // S
        "Sante Singhrs", "Scott Lang", "Snake Jailbird",
        "Sofia Ivanovna Blyuvshtein", "Starlet Bandit", "Stephen Blumberg",
        // V
        "Vincenzo Peruggia", "Vincenzo Pipino",
    ],
    "traitor": [
        // A
        "Alfred Redl", "Alan Nunn May", "Andrey Vlasov",
        // B
        "Benedict Arnold", "Briony Tallis",
        // C
        "Charles Trask", "Charlie Kahn",
        // D
        "Doña Marina",
        // E
        "Edmund Pevensie", "Emilio Aguinaldo", "Ephialtes of Trachis",
        // F
        "Fernand Mondego", "Fredo Corleone",
        // G
        "Gaius Cassius Longinus", "Gollum",
        // I
        "Iago",
        // J
        "Jaime Lannister", "Ji Ben", "Judas Iscariot",
        // L
        "Lu Bu",
        // M
        "Marcus Junius Brutus", "Marvelous Chester", "Maven Calore",
        "Mir Jafar", "Mordechai Vanunu",
        // P
        "Petrus of Thorolund", "Pierre Laval", "Philippe Petain",
        // Q
        "Qin Hui",
        // S
        "Sidney Reilly", "Stella Kubler",
        // T
        "Trusty Patches",
        // V
        "Vidkun Quisling",
        // W
        "Wang Jingwei", "Winston Smith",
    ],
    "vanguard": [
        // A
        "Achilles", "Akbar", "Alaric the Visigoth", "Alexander the Great",
        "Amina Sukhera", "Anita Garibaldi", "Aqualtune", "Aragorn", "Arawelo",
        "Arjuna", "Arminius", "Artemisia of Caria", "Asterix", "Asuna Yuuki",
        "Attila the Hun",
        // B
        "Babur", "Basil the Bulgar-Slayer", "Bhima", "Bjorn Ironside",
        "Boudicca",
        // C
        "Chen Jinnan", "Cnut the Great", "Colestah", "Constantine the Great",
        "Count Roland", "Cynane", "Cyrus the Great",
        // D
        "Douglas Haig", "Duke of Wellington",
        // E
        "Egil Skallagrimsson", "Eric Bloodaxe", "Erik the Red",
        // F
        "Fu Hao",
        // G
        "Galvarino", "Genghis Khan", "George Washington", "Gunnar Hamundarson",
        "Guts",
        // H
        "Hannibal Barca", "Harald Hardrada", "Hatshepsut", "Hattori Hanzo",
        "Hector", "Horatius Cocles",
        // I
        "Isshin",
        // J
        "Joan of Arc", "Julius Caesar",
        // K
        "Kahina", "Khutulun", "King Alfred", "King Arthur", "Knight Artorias",
        // L
        "Lady Trieu", "Leif Erikson", "Leonidas of Sparta", "Lord Nelson",
        "Lozen",
        // M
        "Maria Quiteria", "Maximus Decimus Meridius", "Miltiades",
        "Miyamoto Musashi",
        // N
        "Nakano Takeko", "Napoleon Bonaparte", "Nat Turner",
        // O
        "Obelix", "Oda Nobunaga", "Olympias",
        // P
        "Peter the Great", "Pyrrhus of Epirus",
        // R
        "Ragnor Lodbrok", "Richard the Lionheart", "Rollo of Normandy",
        // S
        "Saladin", "Sam Sharpe", "Sambhaji Bhosale", "Scathach",
        "Scipio Africanus", "Siegward of Catarina", "Simon Bolivar", "Sirris",
        "Sitting Bull", "Slave Knight Gael", "Solaire of Astora", "Sparethra",
        "Spartacus", "Sun Tzu",
        // T
        "T. E. Lawrence", "Teuta", "Tokugawa Ieyasu", "Tomoe Gozen", "Tomyris",
        "Toyotomi Hideyoshi",
        // U
        "Uesugi Kenshin",
        // V
        "Vlad the Impaler", "Vercingetorix",
        // W
        "William the Conqueror", "William Wallace",
        // X
        "Xiahou Dun",
        // Y
        "Yue Fei", "Yuria of Londor",
        // Z
        "Zenobia", "Zheng Yi Sao",
    ],
};

/**
 * Various thresholds related to the penalty.
 */
export const penalty_t = {
    // The penalty percentage threshold at which we should lower our wanted
    // level.  If our penalty percentage is at least this value, then we should
    // re-assign some gang members to jobs such as vigilante justice or ethical
    // hacking to help reduce our wanted level.
    "HIGH": 10,
    // The penalty percentage threshold at which we should move gang members
    // out of jobs that lower our wanted level.  Such jobs are vigilante
    // justice and ethical hacking.  In general, we strive to have as low
    // wanted level as possible.  However, if our wanted level is below this
    // threshold, then we should re-assign members to jobs that yield income.
    "LOW": 2
};

/**
 * Various rootkits we can purchase for a gang member.  Going from top to bottom, the rootkits are listed in ascending
 * order of price.  The rootkit names are taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const rootkit = {
    "NUKE": "NUKE Rootkit",
    "SOUL": "Soulstealer Rootkit",
    "HMAP": "Hmap Node",
    "DEMON": "Demon Rootkit",
    "JACK": "Jack the Ripper",
};

/**
 * Various tasks to which a gang member can be assigned.  The task names are
 * taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/tasks.ts
 */
export const task = {
    // Set a gang member to the idle state.  This is the default state upon
    // recruitment.
    // Gang: criminal, hacking
    "IDLE": "Unassigned",
    //
    // Hacking gangs.
    //
    // Set a gang member to commit cyberterrorism.
    // Gang: hacking
    // Money: N/A
    // Respect: great
    // Wanted: great
    "CYBERTERROR": "Cyberterrorism",
    // Set a gang member to attempt distributed denial of service (DDoS)
    // attacks.
    // Gang: hacking
    // Money: N/A
    // Respect: yes
    // Wanted: yes
    "DDOS": "DDoS Attacks",
    // Set a gang member as an ethical hacker.
    // Gang: hacking
    // Money: yes
    // Respect: N/A
    // Wanted: negative
    "EHACK": "Ethical Hacking",
    // Set a gang member to commit financial fraud and digital counterfeiting.
    // Gang: hacking
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "FRAUD": "Fraud & Counterfeiting",
    // Set a gang member to attempt identity theft.
    // Gang: hacking
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "ID_THEFT": "Identity Theft",
    // Set a gang member to launder money.
    // Gang: hacking
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "LAUNDER": "Money Laundering",
    // Set a gang member to attempt phishing scams and attacks.
    // Gang: hacking
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "PHISH": "Phishing",
    // Set a gang member to create and distribute ransomware.
    // Gang: hacking
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "RANSOMWARE": "Ransomware",
    // Set a gang member to create and distribute malicious viruses.
    // Gang: hacking
    // Money: N/A
    // Respect: yes
    // Wanted: yes
    "VIRUS": "Plant Virus",
    //
    // Criminal gangs.
    //
    // Set a gang member to threaten and blackmail high-profile targets.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "BLACKMAIL": "Threaten & Blackmail",
    // Set a gang member to run cons.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "CON": "Run a Con",
    // Set a gang member to sell drugs.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "DRUGS": "Deal Drugs",
    // Set a gang member to extort civilians in our turf.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: yes
    "EXTORT": "Strongarm Civilians",
    // Set a gang member to randomly mug a person.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: very slight
    "MUG": "Mug People",
    // Set a gang member to commit armed robbery.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "ROBBERY": "Armed Robbery",
    // Set a gang member to commit acts of terrorism.
    // Gang: criminal
    // Money: N/A
    // Respect: great
    // Wanted: great
    "TERROR": "Terrorism",
    // Set a gang member to traffick illegal arms.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "TRAFFICK_ARMS": "Traffick Illegal Arms",
    // Set a gang member to attempt human trafficking.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "TRAFFICK_HUMAN": "Human Trafficking",
    //
    // Both criminal and hacking gangs.
    //
    // Set a gang member to train their Charisma stat.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "CHARISMA": "Train Charisma",
    // Set a gang member to train their combat stats, i.e. Str, Def, Dex, Agi.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "COMBAT": "Train Combat",
    // Set a gang member to train their Hack stat.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "HACK": "Train Hacking",
    // Set a gang member to engage in territorial warfare against other gangs.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "TURF_WAR": "Territory Warfare",
    // Set a gang member to be a vigilante and protect the city from criminals.
    // Gang: criminal, hacking
    // Money: N/A
    // Respect: N/A
    // Wanted: negative
    "VIGILANTE": "Vigilante Justice"
};

/**
 * Stat thresholds related to various tasks.
 */
export const task_t = {
    // The minimum Charisma stat at which a gang member might be assigned to
    // threaten and blackmail high-profile targets.
    "BLACKMAIL": 200,
    // The minimum threshold for the Charisma stat that a new recruit must
    // attain.  A new recruit might be assigned to train their Charisma.  They
    // graduate out of Charisma training after their Charisma stat is at least
    // this number.
    "CHARISMA": 15,
    // The minimum threshold for the combat stats that a new recruit must
    // attain.  A new recruit might be assigned to train their combat stats.
    // They graduate out of combat training after their combat stats are at
    // least this threshold.
    "COMBAT": 15,
    // The minimum Charisma stat at which a gang member might be assigned to
    // running a con.
    "CON": 100,
    // The minimum Hack stat at which a gang member might be assigned to commit
    // acts of cyberterrorism.
    "CYBER_TERROR": 400,
    // The minimum threshold on a combat stat at which a gang member might be
    // assigned to strongarm civilians.  For example,
    // if a member has Strength at least this number, then we might want to
    // re-assign the member to strongarm civilians.
    "EXTORT": 50,
    // The minimum Hack stat at which a gang member might be assigned to commit
    // financial fraud and digital counterfeiting.
    "FRAUD": 200,
    // The minimum threshold for the Hack stat that a new recruit must attain.
    // A new recruit might be assigned to train their Hack stat.  They graduate
    // out of Hack training once their Hack stat is at least this number.
    "HACK": 15,
    // The minimum Hack stat at which a gang member might be assigned to
    // identity theft.
    "ID": 100,
    // The minimum Hack stat at which a gang member might be assigned to
    // launder money.
    "LAUNDER": 300,
    // The minimum Hack stat at which a gang member might be assigned to
    // phishing scams.
    "PHISH": 50,
    // The minimum threshold on a combat stat at which a gang member might be
    // assigned to armed robbery.  For example, if a member has Strength at
    // least this number, then we might want to re-assign the member to armed
    // robbery.
    "ROBBERY": 200,
    // The minimum threshold on a combat stat at which a gang member might be
    // assigned to acts of terrorism.  For example, if a member has Strength at
    // least this number, then we might want to re-assign the member to commit
    // acts of terrorism.
    "TERROR": 400,
    // The minimum threshold on a combat stat at which a gang member might be
    // assigned to trafficking illegal arms.  For example, if a member has
    // Strength at least this number, then we might want to re-assign the
    // member to trafficking illegal arms.
    "TRAFFICK_ARMS": 300,
    // The minimum Charisma stat at which a gang member might be assigned to
    // trafficking humans.
    "TRAFFICK_HUMAN": 300,
};

/**
 * Various vehicles with which a gang member can be equipped.  Going from top
 * to bottom, the vehicles are listed from least expensive to most expensive.
 * The values are taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const vehicle = {
    "FORD": "Ford Flex V20",
    "ATX": "ATX1070 Superbike",
    "MB": "Mercedes-Benz S9001",
    "FERRARI": "White Ferrari"
};

/**
 * Various weapons we can purchase for our gang members.  Going from top to
 * bottom in the given order, the weapons are listed from least expensive to
 * most expensive.  The weapon names are taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const weapon = {
    "BAT": "Baseball Bat",
    "KATANA": "Katana",
    "GLOCK": "Glock 18C",
    "PNINE": "P90C",
    "STEYR": "Steyr AUG",
    "AK": "AK-47",
    "MFIFTEEN": "M15A10 Assault Rifle",
    "AWM": "AWM Sniper Rifle"
};
