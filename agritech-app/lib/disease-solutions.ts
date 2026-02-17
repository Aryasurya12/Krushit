// Disease solution database with multilingual support
export interface DiseaseSolution {
    id: string;
    name: {
        en: string;
        hi: string;
        mr: string;
    };
    cause: {
        en: string;
        hi: string;
        mr: string;
    };
    solution: {
        en: string[];
        hi: string[];
        mr: string[];
    };
    prevention: {
        en: string[];
        hi: string[];
        mr: string[];
    };
    fertilizer?: {
        en: string;
        hi: string;
        mr: string;
    };
    irrigation?: {
        en: string;
        hi: string;
        mr: string;
    };
}

export const diseaseSolutions: Record<string, DiseaseSolution> = {
    'leaf-rust': {
        id: 'leaf-rust',
        name: {
            en: 'Leaf Rust',
            hi: 'पत्ती जंग',
            mr: 'पान गंज'
        },
        cause: {
            en: 'Fungal infection caused by Puccinia species, thrives in high humidity and moderate temperatures.',
            hi: 'पुक्किनिया प्रजातियों के कारण होने वाला कवक संक्रमण, उच्च आर्द्रता और मध्यम तापमान में पनपता है।',
            mr: 'पुक्किनिया प्रजातींमुळे होणारा बुरशीजन्य संसर्ग, उच्च आर्द्रता आणि मध्यम तापमानात वाढतो।'
        },
        solution: {
            en: [
                'Remove and destroy infected leaves immediately',
                'Apply fungicide containing azoxystrobin or propiconazole',
                'Spray early morning or late evening for best results',
                'Repeat application every 10-14 days if infection persists'
            ],
            hi: [
                'संक्रमित पत्तियों को तुरंत हटाएं और नष्ट करें',
                'एज़ोक्सीस्ट्रोबिन या प्रोपिकोनाज़ोल युक्त कवकनाशी लगाएं',
                'सर्वोत्तम परिणामों के लिए सुबह जल्दी या देर शाम छिड़काव करें',
                'यदि संक्रमण बना रहता है तो हर 10-14 दिनों में दोबारा लगाएं'
            ],
            mr: [
                'संक्रमित पाने ताबडतोब काढून टाका आणि नष्ट करा',
                'अॅझॉक्सीस्ट्रोबिन किंवा प्रोपिकोनाझोल असलेले बुरशीनाशक लावा',
                'सर्वोत्तम परिणामांसाठी लवकर सकाळी किंवा संध्याकाळी फवारणी करा',
                'संसर्ग कायम राहिल्यास दर 10-14 दिवसांनी पुन्हा लावा'
            ]
        },
        prevention: {
            en: [
                'Improve air circulation between plants',
                'Avoid overhead irrigation during humid conditions',
                'Monitor crops regularly for early detection',
                'Use resistant crop varieties when available',
                'Maintain proper plant spacing'
            ],
            hi: [
                'पौधों के बीच हवा के संचलन में सुधार करें',
                'नम परिस्थितियों में ऊपरी सिंचाई से बचें',
                'शीघ्र पता लगाने के लिए नियमित रूप से फसलों की निगरानी करें',
                'उपलब्ध होने पर प्रतिरोधी फसल किस्मों का उपयोग करें',
                'उचित पौधों की दूरी बनाए रखें'
            ],
            mr: [
                'रोपांमधील हवा परिसंचरण सुधारा',
                'आर्द्र परिस्थितीत वरून पाणी देणे टाळा',
                'लवकर शोधासाठी नियमितपणे पिकांचे निरीक्षण करा',
                'उपलब्ध असल्यास प्रतिरोधक पीक जाती वापरा',
                'योग्य रोप अंतर राखा'
            ]
        },
        fertilizer: {
            en: 'Apply balanced NPK (10-10-10) to strengthen plant immunity. Add potassium-rich fertilizer to improve disease resistance.',
            hi: 'पौधे की प्रतिरक्षा को मजबूत करने के लिए संतुलित NPK (10-10-10) लगाएं। रोग प्रतिरोधक क्षमता बढ़ाने के लिए पोटेशियम युक्त उर्वरक डालें।',
            mr: 'वनस्पती प्रतिकारशक्ती मजबूत करण्यासाठी संतुलित NPK (10-10-10) लावा. रोग प्रतिकारशक्ती सुधारण्यासाठी पोटॅशियम समृद्ध खत घाला.'
        },
        irrigation: {
            en: 'Reduce irrigation frequency. Water at soil level, avoid wetting leaves. Best time: early morning (6-8 AM).',
            hi: 'सिंचाई की आवृत्ति कम करें। मिट्टी के स्तर पर पानी दें, पत्तियों को गीला करने से बचें। सर्वोत्तम समय: सुबह जल्दी (6-8 AM)।',
            mr: 'सिंचन वारंवारता कमी करा. मातीच्या पातळीवर पाणी द्या, पाने ओली करणे टाळा. सर्वोत्तम वेळ: लवकर सकाळी (6-8 AM).'
        }
    },
    'blast-disease': {
        id: 'blast-disease',
        name: {
            en: 'Blast Disease',
            hi: 'ब्लास्ट रोग',
            mr: 'ब्लास्ट रोग'
        },
        cause: {
            en: 'Caused by Magnaporthe oryzae fungus, spreads rapidly in wet conditions with high nitrogen levels.',
            hi: 'मैग्नापोर्थे ओराइज़े कवक के कारण होता है, उच्च नाइट्रोजन स्तर के साथ गीली परिस्थितियों में तेजी से फैलता है।',
            mr: 'मॅग्नापोर्थे ओरायझे बुरशीमुळे होतो, उच्च नायट्रोजन पातळीसह ओल्या परिस्थितीत वेगाने पसरतो.'
        },
        solution: {
            en: [
                'Apply tricyclazole or carbendazim fungicide immediately',
                'Remove severely infected plants to prevent spread',
                'Increase potassium fertilization to strengthen plants',
                'Ensure proper drainage in fields'
            ],
            hi: [
                'तुरंत ट्राइसाइक्लाज़ोल या कार्बेन्डाज़िम कवकनाशी लगाएं',
                'प्रसार को रोकने के लिए गंभीर रूप से संक्रमित पौधों को हटा दें',
                'पौधों को मजबूत करने के लिए पोटेशियम उर्वरक बढ़ाएं',
                'खेतों में उचित जल निकासी सुनिश्चित करें'
            ],
            mr: [
                'ताबडतोब ट्रायसायक्लाझोल किंवा कार्बेंडाझिम बुरशीनाशक लावा',
                'प्रसार रोखण्यासाठी गंभीरपणे संक्रमित रोपे काढून टाका',
                'रोपे मजबूत करण्यासाठी पोटॅशियम खत वाढवा',
                'शेतात योग्य निचरा सुनिश्चित करा'
            ]
        },
        prevention: {
            en: [
                'Use certified disease-free seeds',
                'Avoid excessive nitrogen fertilization',
                'Maintain balanced nutrient levels',
                'Practice crop rotation',
                'Remove crop residues after harvest'
            ],
            hi: [
                'प्रमाणित रोग मुक्त बीजों का उपयोग करें',
                'अत्यधिक नाइट्रोजन उर्वरक से बचें',
                'संतुलित पोषक स्तर बनाए रखें',
                'फसल चक्र का अभ्यास करें',
                'कटाई के बाद फसल अवशेष हटा दें'
            ],
            mr: [
                'प्रमाणित रोगमुक्त बियाणे वापरा',
                'जास्त नायट्रोजन खत टाळा',
                'संतुलित पोषक पातळी राखा',
                'पीक आलटून पालट करा',
                'कापणीनंतर पीक अवशेष काढून टाका'
            ]
        },
        fertilizer: {
            en: 'Reduce nitrogen, increase potassium (NPK 15-5-25). Apply silicon-based fertilizer to strengthen cell walls.',
            hi: 'नाइट्रोजन कम करें, पोटेशियम बढ़ाएं (NPK 15-5-25)। कोशिका दीवारों को मजबूत करने के लिए सिलिकॉन आधारित उर्वरक लगाएं।',
            mr: 'नायट्रोजन कमी करा, पोटॅशियम वाढवा (NPK 15-5-25). पेशी भिंती मजबूत करण्यासाठी सिलिकॉन-आधारित खत लावा.'
        },
        irrigation: {
            en: 'Avoid continuous flooding. Use intermittent irrigation. Drain fields periodically to reduce humidity.',
            hi: 'निरंतर बाढ़ से बचें। आंतरायिक सिंचाई का उपयोग करें। आर्द्रता कम करने के लिए समय-समय पर खेतों को सूखा दें।',
            mr: 'सतत पूर टाळा. मधूनमधून सिंचन वापरा. आर्द्रता कमी करण्यासाठी वेळोवेळी शेते निचरा करा.'
        }
    },
    'aphid-infestation': {
        id: 'aphid-infestation',
        name: {
            en: 'Aphid Infestation',
            hi: 'एफिड संक्रमण',
            mr: 'एफिड प्रादुर्भाव'
        },
        cause: {
            en: 'Small sap-sucking insects that multiply rapidly in warm, dry conditions. Spread viral diseases.',
            hi: 'छोटे रस चूसने वाले कीड़े जो गर्म, शुष्क परिस्थितियों में तेजी से बढ़ते हैं। वायरल रोग फैलाते हैं।',
            mr: 'लहान रस शोषक कीटक जे उबदार, कोरड्या परिस्थितीत वेगाने वाढतात. विषाणूजन्य रोग पसरवतात.'
        },
        solution: {
            en: [
                'Spray neem oil solution (5ml per liter) every 5-7 days',
                'Use insecticidal soap for immediate control',
                'Apply imidacloprid for severe infestations',
                'Introduce natural predators like ladybugs'
            ],
            hi: [
                'हर 5-7 दिनों में नीम तेल का घोल (5ml प्रति लीटर) छिड़कें',
                'तत्काल नियंत्रण के लिए कीटनाशक साबुन का उपयोग करें',
                'गंभीर संक्रमण के लिए इमिडाक्लोप्रिड लगाएं',
                'लेडीबग जैसे प्राकृतिक शिकारियों को पेश करें'
            ],
            mr: [
                'दर 5-7 दिवसांनी कडुलिंबाच्या तेलाचे द्रावण (5ml प्रति लिटर) फवारा',
                'त्वरित नियंत्रणासाठी कीटकनाशक साबण वापरा',
                'गंभीर प्रादुर्भावासाठी इमिडाक्लोप्रिड लावा',
                'लेडीबग सारखे नैसर्गिक भक्षक आणा'
            ]
        },
        prevention: {
            en: [
                'Plant companion crops like marigold to repel aphids',
                'Use reflective mulch to confuse pests',
                'Monitor crops weekly for early detection',
                'Maintain plant health with proper nutrition',
                'Remove weeds that harbor aphids'
            ],
            hi: [
                'एफिड को दूर भगाने के लिए गेंदे जैसी सहयोगी फसलें लगाएं',
                'कीटों को भ्रमित करने के लिए परावर्तक मल्च का उपयोग करें',
                'शीघ्र पता लगाने के लिए साप्ताहिक फसलों की निगरानी करें',
                'उचित पोषण के साथ पौधों का स्वास्थ्य बनाए रखें',
                'एफिड को आश्रय देने वाले खरपतवार हटा दें'
            ],
            mr: [
                'एफिड दूर ठेवण्यासाठी झेंडू सारख्या सहचर पिके लावा',
                'कीटकांना गोंधळात टाकण्यासाठी परावर्तक आच्छादन वापरा',
                'लवकर शोधासाठी साप्ताहिक पिकांचे निरीक्षण करा',
                'योग्य पोषणासह वनस्पती आरोग्य राखा',
                'एफिडला आश्रय देणारे तण काढून टाका'
            ]
        },
        fertilizer: {
            en: 'Avoid excess nitrogen which promotes soft growth attractive to aphids. Use balanced NPK (10-10-10).',
            hi: 'अतिरिक्त नाइट्रोजन से बचें जो एफिड के लिए आकर्षक कोमल वृद्धि को बढ़ावा देता है। संतुलित NPK (10-10-10) का उपयोग करें।',
            mr: 'जास्त नायट्रोजन टाळा जे एफिडसाठी आकर्षक मऊ वाढ वाढवते. संतुलित NPK (10-10-10) वापरा.'
        },
        irrigation: {
            en: 'Use overhead sprinklers to wash off aphids. Water stress attracts aphids, maintain consistent moisture.',
            hi: 'एफिड को धोने के लिए ऊपरी छिड़काव का उपयोग करें। पानी का तनाव एफिड को आकर्षित करता है, लगातार नमी बनाए रखें।',
            mr: 'एफिड धुण्यासाठी वरून फवारे वापरा. पाण्याचा ताण एफिडला आकर्षित करतो, सातत्यपूर्ण आर्द्रता राखा.'
        }
    }
};

export function getDiseaseSolution(diseaseId: string): DiseaseSolution | null {
    const solution = diseaseSolutions[diseaseId];
    if (!solution) return null;
    return solution;
}
