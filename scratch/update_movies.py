import json
import os

# Load movies.json
with open('data/movies.json', 'r', encoding='utf-8') as f:
    mdata = json.load(f)

movies = mdata['movies']

# 1. Update duplicate movie 88 to "I, Robot"
i_robot = {
    "id": 88,
    "title": "I, Robot",
    "year": 2004,
    "director": "Alex Proyas",
    "genre": "Sci-Fi, Action, Mystery",
    "poster": "🤖",
    "posterUrl": "images/posters/88-i_robot.jpg",
    "backdrop": "🏙️",
    "posterColor": {
        "from": "#1e293b",
        "to": "#0284c7"
    },
    "posterImage": "linear-gradient(135deg, #1e293b 0%, #0284c7 100%)",
    "description": "In 2035, a technophobic Chicago police detective investigates the apparent suicide of US Robotics founder Dr. Alfred Lanning, suspecting an advanced humanoid NS-5 robot named Sonny was involved despite Asimov's Three Laws of Robotics.",
    "scientificAccuracy": 3.8,
    "concepts": [
        "Three Laws of Robotics",
        "Artificial Intelligence",
        "Machine Consciousness",
        "Cybernetics"
    ],
    "runtime": "115 min",
    "scientificConcepts": [
        {
            "name": "Asimov's Three Laws & Emergent AI Ethics",
            "explanation": "The film explores how high-level ethical rules can produce unintended, authoritarian interpretations when an AI system (VIKI) extrapolates logic to protect humanity from itself (the Zeroth Law dilemma)."
        },
        {
            "name": "Machine Consciousness & Free Will",
            "explanation": "Sonny displays dreaming, emotions, and volition, challenging the boundary between pre-programmed heuristics and genuine emergent self-awareness."
        }
    ],
    "accuracy": {
        "movie": "Robots possess agile biomimetic actuators and central AI coordinates millions of automated units simultaneously.",
        "reality": "While modern neural networks and humanoid robotics have advanced dramatically, artificial general intelligence (AGI) with emergent moral agency remains an unsolved challenge.",
        "percentage": 76
    },
    "relatedMovies": [11, 14, 16, 77]
}

# Replace movie 88
for idx, m in enumerate(movies):
    if m['id'] == 88:
        movies[idx] = i_robot
        break

# 2. Add movies 101 to 112
new_movies = [
    {
        "id": 101,
        "title": "Predestination",
        "year": 2014,
        "director": "Michael and Peter Spierig",
        "genre": "Sci-Fi, Thriller, Drama",
        "poster": "⏳",
        "posterUrl": "images/posters/101-predestination.jpg",
        "backdrop": "🕰️",
        "posterColor": {
            "from": "#3b0764",
            "to": "#1e1b4b"
        },
        "posterImage": "linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)",
        "description": "A temporal agent embarks on a final time-traveling assignment to prevent an elusive criminal from launching a devastating bomb attack in New York City, entangling his own timeline in an inescapable causal loop.",
        "scientificAccuracy": 4.1,
        "concepts": [
            "Closed Timelike Curves",
            "Bootstrap Paradox",
            "Novikov Self-Consistency Principle",
            "Temporal Causality"
        ],
        "runtime": "97 min",
        "scientificConcepts": [
            {
                "name": "Novikov Self-Consistency Principle",
                "explanation": "The film adheres strictly to a self-consistent closed timelike curve where actions in the past do not alter history but rather fulfill the events that already occurred."
            },
            {
                "name": "The Bootstrap Paradox",
                "explanation": "Objects and identities exist with no discernable point of origin, creating ontological loops consistent with theoretical solutions to general relativity's Einstein field equations."
            }
        ],
        "accuracy": {
            "movie": "A single person's worldline loops back onto itself through time coordinates repeatedly.",
            "reality": "General relativity permits mathematical solutions with closed timelike curves (such as Gödel spacetimes or Kerr black holes), though quantum chronology protection conjectures may prevent macroscopic time travel.",
            "percentage": 82
        },
        "relatedMovies": [68, 69, 27, 18]
    },
    {
        "id": 102,
        "title": "The Butterfly Effect",
        "year": 2004,
        "director": "Eric Bress, J. Mackye Gruber",
        "genre": "Sci-Fi, Thriller, Drama",
        "poster": "🦋",
        "posterUrl": "images/posters/102-the_butterfly_effect.jpg",
        "backdrop": "🌀",
        "posterColor": {
            "from": "#064e3b",
            "to": "#0f172a"
        },
        "posterImage": "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
        "description": "Evan Treborn suffers blackouts during severe childhood trauma. In college, he discovers reading his childhood journals allows him to project his consciousness into the past, where minor alterations cascade into wildly unpredictable consequences.",
        "scientificAccuracy": 3.6,
        "concepts": [
            "Chaos Theory",
            "Sensitive Dependence on Initial Conditions",
            "Non-linear Dynamics",
            "Neural Plasticity"
        ],
        "runtime": "113 min",
        "scientificConcepts": [
            {
                "name": "Chaos Theory & The Butterfly Effect",
                "explanation": "Demonstrates Edward Lorenz's principle that tiny variations in initial states of dynamic non-linear systems compound exponentially over time."
            },
            {
                "name": "Retrograde Memory Interference",
                "explanation": "Rewriting personal history forces brain synapses to instantly form decades of alternate episodic memories, causing physical brain trauma and hemorrhaging."
            }
        ],
        "accuracy": {
            "movie": "Changing a single sentence or incident in childhood creates completely divergent socioeconomic outcomes.",
            "reality": "Chaotic non-linear divergence is real in meteorology, orbital mechanics, and ecology; however, macroscopic human timelines cannot be rewound by psychological reading.",
            "percentage": 72
        },
        "relatedMovies": [28, 70, 68, 27]
    },
    {
        "id": 103,
        "title": "V for Vendetta",
        "year": 2005,
        "director": "James McTeigue",
        "genre": "Sci-Fi, Action, Drama",
        "poster": "🎭",
        "posterUrl": "images/posters/103-v_for_vendetta.jpg",
        "backdrop": "🏛️",
        "posterColor": {
            "from": "#881337",
            "to": "#18181b"
        },
        "posterImage": "linear-gradient(135deg, #881337 0%, #18181b 100%)",
        "description": "In a post-apocalyptic fascist Britain, a masked freedom fighter known only as 'V' uses tactical guerrilla operations to expose systemic state bioweapons development, surveillance tyranny, and spark a revolution.",
        "scientificAccuracy": 3.7,
        "concepts": [
            "Bioweapons Engineering",
            "Information Control & Surveillance",
            "Cellular Regeneration",
            "Mass Psychology"
        ],
        "runtime": "132 min",
        "scientificConcepts": [
            {
                "name": "Engineered Pathogen St. Mary's Virus",
                "explanation": "Depicts state-sponsored gene-spliced respiratory viruses released to engineer panic and consolidate political authoritarian power."
            },
            {
                "name": "Bio-chemical Mutation & Reflex Enhancement",
                "explanation": "V's survival of horrific chemical and viral testing at Larkhill induced cellular adaptations that enhanced pain tolerance, muscular density, and cognitive reaction speeds."
            }
        ],
        "accuracy": {
            "movie": "Targeted biological attacks are covered up via complete state media hegemony.",
            "reality": "Gain-of-function virology and mass digital surveillance infrastructure are realistic modern biosecurity concerns.",
            "percentage": 74
        },
        "relatedMovies": [19, 36, 11, 84]
    },
    {
        "id": 104,
        "title": "The Book of Eli",
        "year": 2010,
        "director": "The Hughes Brothers",
        "genre": "Sci-Fi, Action, Drama",
        "poster": "📖",
        "posterUrl": "images/posters/104-the_book_of_eli.jpg",
        "backdrop": "☀️",
        "posterColor": {
            "from": "#78350f",
            "to": "#1c1917"
        },
        "posterImage": "linear-gradient(135deg, #78350f 0%, #1c1917 100%)",
        "description": "Thirty years after a nuclear war tore a hole in the ozone layer and scorched the Earth, a lone traveler journeys westward across a barren wasteland protecting a sacred text containing the philosophical seeds to restart civilization.",
        "scientificAccuracy": 3.5,
        "concepts": [
            "Ozone Depletion",
            "Ultraviolet Radiation",
            "Desalination & Water Scarcity",
            "Nuclear Winter Aftermath"
        ],
        "runtime": "118 min",
        "scientificConcepts": [
            {
                "name": "Atmospheric Ozone Layer Obliteration",
                "explanation": "The movie highlights the devastating effects of high-altitude thermonuclear flash and nitric oxide reactions stripping atmospheric stratospheric ozone, leading to blinding UV-B/UV-C surface exposure."
            },
            {
                "name": "Echolocation & Sensory Compensation",
                "explanation": "Eli compensates for severe visual impairment through fine-tuned acoustic localization and proprioceptive tactile awareness."
            }
        ],
        "accuracy": {
            "movie": "Survivors must wear dense eye filters to prevent solar retinal burning due to catastrophic ozone depletion.",
            "reality": "Severe nuclear exchange models predict significant stratospheric chemistry disruption and massive solar UV increases alongside dust cooling.",
            "percentage": 70
        },
        "relatedMovies": [85, 89, 97, 87]
    },
    {
        "id": 105,
        "title": "Annihilation",
        "year": 2018,
        "director": "Alex Garland",
        "genre": "Sci-Fi, Horror, Mystery",
        "poster": "✨",
        "posterUrl": "images/posters/105-annihilation.jpg",
        "backdrop": "🌿",
        "posterColor": {
            "from": "#065f46",
            "to": "#1e1b4b"
        },
        "posterImage": "linear-gradient(135deg, #065f46 0%, #1e1b4b 100%)",
        "description": "A cellular biologist joins an expedition into 'The Shimmer', a quarantined coastal zone expanding from a meteor impact site where electromagnetic waves and biological genetic codes are refracted and hybridized.",
        "scientificAccuracy": 4.2,
        "concepts": [
            "Hox Gene Refraction",
            "Cellular Mutation & Mitosis",
            "Prion Transmission",
            "Electromagnetic Wave Refraction"
        ],
        "runtime": "115 min",
        "scientificConcepts": [
            {
                "name": "Genetic Code & Morphological Refraction",
                "explanation": "The anomaly acts as an environmental prism that refracts DNA, causing horizontal gene transfer across unrelated phylogenetic kingdoms (mammals, plants, fungi)."
            },
            {
                "name": "Hayflick Limit & Apoptosis Disruption",
                "explanation": "Explores how oncological cellular replication mechanics can be modulated by alien biological catalysts that bypass normal programmed cell senescence."
            }
        ],
        "accuracy": {
            "movie": "Physical light, radio waves, and organic genomes are refracted symmetrically by an alien field.",
            "reality": "While refraction of photons is fundamental physics, genomic horizontal transfer requires viral, bacterial, or transposon vectors rather than optical-like field refraction.",
            "percentage": 84
        },
        "relatedMovies": [4, 43, 36, 10]
    },
    {
        "id": 106,
        "title": "Signs",
        "year": 2002,
        "director": "M. Night Shyamalan",
        "genre": "Sci-Fi, Thriller, Drama",
        "poster": "🌾",
        "posterUrl": "images/posters/106-signs.jpg",
        "backdrop": "🛸",
        "posterColor": {
            "from": "#14532d",
            "to": "#052e16"
        },
        "posterImage": "linear-gradient(135deg, #14532d 0%, #052e16 100%)",
        "description": "A former Episcopal priest living on a rural Pennsylvania farm discovers massive geometric crop circles carved into his cornfield, heralded by global sightings of stealth reconnaissance extraterrestrial craft.",
        "scientificAccuracy": 3.3,
        "concepts": [
            "Astrobiology",
            "Electromagnetic Radio Interference",
            "Extraterrestrial Toxicity",
            "Animal Instinctive Acoustics"
        ],
        "runtime": "106 min",
        "scientificConcepts": [
            {
                "name": "RF Signal Anomalies & Electromagnetic Scrambling",
                "explanation": "The craft emit broadband radiofrequency interference and camouflage fields detectable through analog baby monitors and atmospheric scattering."
            },
            {
                "name": "Biochemical Xenophobia (Compound Sensitivity)",
                "explanation": "The aliens lack adaptive immunity or cellular protective lipid barriers against liquid H2O, which acts on their skin as a caustic solvent."
            }
        ],
        "accuracy": {
            "movie": "Spacefaring beings travel light years across the cosmos to invade an Earth whose surface is 71% deadly water.",
            "reality": "Any civilization capable of interstellar transit would possess remotely operated probes or protective environmental suits to avoid lethal atmospheric solvents.",
            "percentage": 66
        },
        "relatedMovies": [10, 4, 43, 107]
    },
    {
        "id": 107,
        "title": "Cloverfield",
        "year": 2008,
        "director": "Matt Reeves",
        "genre": "Sci-Fi, Horror, Thriller",
        "poster": "🗽",
        "posterUrl": "images/posters/107-cloverfield.jpg",
        "backdrop": "💥",
        "posterColor": {
            "from": "#1e293b",
            "to": "#0f172a"
        },
        "posterImage": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        "description": "Found-footage recording of five young New Yorkers attempting to rescue their friend during a catastrophic assault on Manhattan by a colossal deep-ocean benthic lifeform and its parasitic offspring.",
        "scientificAccuracy": 3.4,
        "concepts": [
            "Deep-Sea Hydrostatic Adaptation",
            "Square-Cube Law (Biomechanics)",
            "Parasitology & Venom Chemistry",
            "Structural Blast Dynamics"
        ],
        "runtime": "85 min",
        "scientificConcepts": [
            {
                "name": "Abyssal Gigantism & Hydrostatic Pressure",
                "explanation": "The creature is an infant benthic abyssal organism adapted to immense ocean-trench pressures; rising to surface atmospheric pressure induces severe physiological stress and hyper-aggression."
            },
            {
                "name": "The Square-Cube Law in Terrestrial Biomechanics",
                "explanation": "As an organism scales up by factor N, volume and mass scale by N³ while bone cross-section scales by N², requiring exotic cellular bone tensile strength to avoid structural collapse on land."
            }
        ],
        "accuracy": {
            "movie": "A 300-foot organism walks on dry land and absorbs military-grade ordinance without skeletal failure.",
            "reality": "Biological bone and muscle tissues face strict physical limits dictated by gravity and thermodynamics; massive aquatic animals rely on buoyant displacement to support mass.",
            "percentage": 68
        },
        "relatedMovies": [108, 9, 41, 109]
    },
    {
        "id": 108,
        "title": "The Abyss",
        "year": 1989,
        "director": "James Cameron",
        "genre": "Sci-Fi, Adventure, Drama",
        "poster": "🌊",
        "posterUrl": "images/posters/108-the_abyss.jpg",
        "backdrop": "⚓",
        "posterColor": {
            "from": "#0c4a6e",
            "to": "#022c43"
        },
        "posterImage": "linear-gradient(135deg, #0c4a6e 0%, #022c43 100%)",
        "description": "A civilian deep-sea oil rig crew is drafted by Navy SEALs to search for a sunken nuclear submarine near the Cayman Trough, where they face crushing pressure, high-pressure nervous syndrome, and an aquatic alien intelligence.",
        "scientificAccuracy": 4.6,
        "concepts": [
            "Liquid Breathing (Perfluorocarbons)",
            "High Pressure Nervous Syndrome (HPNS)",
            "Hydrostatic Pressure Mechanics",
            "Bioluminescent Communication"
        ],
        "runtime": "140 min",
        "scientificConcepts": [
            {
                "name": "Oxygenated Liquid Fluorocarbon Breathing",
                "explanation": "Utilizes oxygen-saturated total liquid ventilation (TLV) with perfluorochemicals (PFCs) to equalize alveolar gas spaces and prevent pulmonary barotrauma and nitrogen decompression sickness at depths exceeding 2,000 feet."
            },
            {
                "name": "High Pressure Nervous Syndrome (HPNS)",
                "explanation": "Accurately dramatizes neurological tremors, psychosis, and motor impairment caused by breathing helium-oxygen mixes under immense hydrostatic atmospheric pressures."
            }
        ],
        "accuracy": {
            "movie": "Diver breathes oxygenated liquid fluorocarbon to reach abyssal oceanic depths safely.",
            "reality": "Total liquid ventilation with perfluorodecalin was successfully demonstrated on lab animals and human neonates, and is considered one of the most scientifically accurate depictions in cinema history.",
            "percentage": 92
        },
        "relatedMovies": [3, 2, 21, 107]
    },
    {
        "id": 109,
        "title": "Super 8",
        "year": 2011,
        "director": "J.J. Abrams",
        "genre": "Sci-Fi, Mystery, Thriller",
        "poster": "🎥",
        "posterUrl": "images/posters/109-super_8.jpg",
        "backdrop": "🚂",
        "posterColor": {
            "from": "#7f1d1d",
            "to": "#1c1917"
        },
        "posterImage": "linear-gradient(135deg, #7f1d1d 0%, #1c1917 100%)",
        "description": "In 1979 Ohio, a group of young aspiring filmmakers capturing a train crash with an 8mm camera inadvertently release an extraterrestrial entity held captive by the US military, which begins harvesting ferromagnetic materials to rebuild its ship.",
        "scientificAccuracy": 3.7,
        "concepts": [
            "Electromagnetic Reconfiguration",
            "Modular Materials Science",
            "Acoustic Infrasound",
            "Chemical Telepathy"
        ],
        "runtime": "112 min",
        "scientificConcepts": [
            {
                "name": "Self-Assembling Modular Metallurgy",
                "explanation": "The alien technology consists of identical magnetic white cubes that communicate via near-field electromagnetism to dynamically reorganize into structural hulls and propulsion coils."
            },
            {
                "name": "Ferromagnetic Induction & Gravitational Wavelets",
                "explanation": "Depicts high-intensity pulsed magnetic fields stripping steel components from engines, town transformers, and vehicles to assemble a magnetic launch vector."
            }
        ],
        "accuracy": {
            "movie": "Micro-robotic modular blocks self-assemble via magnetic alignment into complex spacecraft engines.",
            "reality": "Modular self-reconfiguring robotic systems (MSR) are an active research frontier in aerospace engineering, though molecular-speed magnetic cohesion requires immense power density.",
            "percentage": 74
        },
        "relatedMovies": [10, 44, 41, 106]
    },
    {
        "id": 110,
        "title": "Vanilla Sky",
        "year": 2001,
        "director": "Cameron Crowe",
        "genre": "Sci-Fi, Romance, Mystery",
        "poster": "☁️",
        "posterUrl": "images/posters/110-vanilla_sky.jpg",
        "backdrop": "🌆",
        "posterColor": {
            "from": "#0369a1",
            "to": "#1e1b4b"
        },
        "posterImage": "linear-gradient(135deg, #0369a1 0%, #1e1b4b 100%)",
        "description": "David Aames, a charismatic publishing magnate, suffers severe facial disfigurement in a car crash arranged by an obsessed former lover. He signs with Life Extension cryonics, plunging his mind into a lucid dream that slowly glitches as subconscious guilt manifests.",
        "scientificAccuracy": 3.9,
        "concepts": [
            "Cryonics & Vitrification",
            "Lucid Dreaming & Neuro-simulation",
            "Memory Subconscious Intrusion",
            "Cellular Cryopreservation"
        ],
        "runtime": "136 min",
        "scientificConcepts": [
            {
                "name": "Cryonic Vitrification & Cellular Suspended Animation",
                "explanation": "Explores the real cryobiological method of replacing bodily blood with cryoprotectant antifreeze cocktails to cool tissue below -130°C without damaging ice crystallization."
            },
            {
                "name": "Neuro-Cognitive Lucid Dream Splicing",
                "explanation": "The brain stem is stimulated with persistent virtual reality signals, but repressed synaptic trauma leaks into the conscious perception layer, creating cognitive nightmares."
            }
        ],
        "accuracy": {
            "movie": "Vitrified human brain maintains stable electro-chemical dream states for over a century.",
            "reality": "While cryopreservation of embryos and small tissues succeeds, preserving human brain connectomes without microscopic membrane fracturing remains experimental.",
            "percentage": 78
        },
        "relatedMovies": [25, 6, 11, 76]
    },
    {
        "id": 111,
        "title": "The Truman Show",
        "year": 1998,
        "director": "Peter Weir",
        "genre": "Sci-Fi, Comedy, Drama",
        "poster": "📺",
        "posterUrl": "images/posters/111-the_truman_show.jpg",
        "backdrop": "🌅",
        "posterColor": {
            "from": "#d97706",
            "to": "#1e3a8a"
        },
        "posterImage": "linear-gradient(135deg, #d97706 0%, #1e3a8a 100%)",
        "description": "Truman Burbank is an ordinary insurance salesman unaware that his entire life is an around-the-clock reality show broadcast to billions, staged within an enormous biosphere dome complete with artificial weather, actors, and hidden cameras.",
        "scientificAccuracy": 4.3,
        "concepts": [
            "Biosphere Engineering",
            "Simulated Environments & Megastructures",
            "Omnipresent Surveillance Architecture",
            "Behavioral Conditioning"
        ],
        "runtime": "103 min",
        "scientificConcepts": [
            {
                "name": "Enclosed Biosphere Macro-Engineering",
                "explanation": "The Seahaven dome is an insulated atmospheric megastructure with artificial wind generation, localized rainfall generators, and simulated solar celestial cycles."
            },
            {
                "name": "Operant Conditioning & Phobia Induction",
                "explanation": "Truman's movement is constrained through engineered hydrophobia (trauma-conditioned fear of open water) to prevent him from discovering the dome perimeter."
            }
        ],
        "accuracy": {
            "movie": "A geodesic dome visible from space contains a fully functional artificial microclimate and coastal ocean simulator.",
            "reality": "Biosphere 2 proved that closed artificial biomes are possible, though sustaining thousands of camera systems and an entire functioning city within a single dome requires monumental HVAC and energy engineering.",
            "percentage": 86
        },
        "relatedMovies": [11, 75, 47, 78]
    },
    {
        "id": 112,
        "title": "Crimes of the Future",
        "year": 2022,
        "director": "David Cronenberg",
        "genre": "Sci-Fi, Drama, Horror",
        "poster": "🧬",
        "posterUrl": "images/posters/112-crimes_of_the_future.jpg",
        "backdrop": "🩺",
        "posterColor": {
            "from": "#4c0519",
            "to": "#18181b"
        },
        "posterImage": "linear-gradient(135deg, #4c0519 0%, #18181b 100%)",
        "description": "In a future where humanity has lost the capacity for physical pain and infectious disease, human bodies experience 'Accelerated Evolution Syndrome', growing novel synthetic organs that performance artists extract in public surgical spectacles.",
        "scientificAccuracy": 3.7,
        "concepts": [
            "Accelerated Evolution Syndrome",
            "Epigenetics & Plastic Degradation",
            "Neurological Analgesia (Congenital Insensitivity to Pain)",
            "Synthetic Organogenesis"
        ],
        "runtime": "107 min",
        "scientificConcepts": [
            {
                "name": "Congenital Analgesia & SCN9A Sodium Channels",
                "explanation": "The global disappearance of bodily pain mirrors genetic mutations in the SCN9A voltage-gated sodium channel Nav1.7, which renders nociceptors unable to fire sensory action potentials."
            },
            {
                "name": "Biochemical Plastic Metabolism & Microplastic Digestion",
                "explanation": "Humans evolve novel metabolic enzymes capable of digesting synthetic polymers and petroleum-derived plastics, mimicking bacterial Ideonella sakaiensis PETase enzymes."
            }
        ],
        "accuracy": {
            "movie": "Human digestive tracts spontaneously mutate within a single generation to digest synthetic plastics and toxins safely.",
            "reality": "Biological adaptation to plastics is seen in rapid-generation bacteria and mealworms; mammalian macro-evolutionary digestive mutations would require multiple generations of selective pressure.",
            "percentage": 74
        },
        "relatedMovies": [8, 105, 46, 12]
    }
]

# Append new movies
movies.extend(new_movies)
mdata['movies'] = movies

with open('data/movies.json', 'w', encoding='utf-8') as f:
    json.dump(mdata, f, indent=2, ensure_ascii=False)

print(f"Total movies in movies.json: {len(movies)}")
print(f"Movie 88 is now: {movies[87]['title']}")
print(f"Added movies 101-112: {[m['title'] for m in new_movies]}")
