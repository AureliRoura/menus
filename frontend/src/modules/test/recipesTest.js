import { useRecipesStore } from '@/stores/recipesStore';

export default function useRecipesTest() {
  const store = useRecipesStore();

  store.clear();
  store.addRecipe({ id: 1, name: "Amanida de cuscús amb verdures rostides i formatge feta", ingredients: [
    { name: "Cuscús", quantity: 75, unit: "grams" },
    { name: "Carbassó", quantity: 0.5, unit: "unitat" },
    { name: "Pebrot", quantity: 0.5, unit: "unitat" },
    { name: "Ceba", quantity: 0.25, unit: "unitat" },
    { name: "Formatge feta", quantity: 30, unit: "grams" }
  ], desc: "Prepara el cuscús segons les instruccions del paquet durant 10 minuts. Rosteix les verdures al forn durant 20 minuts i barreja-les amb el cuscús. Afegeix el formatge feta esmicolat per sobre.", 
    time: "30 min" });
  store.addRecipe({ id: 2, name: "Amanida de pasta amb tonyina i oli de llimona", ingredients: [
    { name: "Pasta", quantity: 75, unit: "grams" },
    { name: "Tonyina", quantity: 0.5, unit: "llauna" },
    { name: "Enciam", quantity: 0.25, unit: "unitat" },
    { name: "Oli de llimona", quantity: 1, unit: "cullerada" }
  ], desc: "Bulla la pasta durant 10 minuts i escorre-la. Barreja-la amb la tonyina i l'enciam tallat. Afegeix",
    time: "15 min" });
  store.addRecipe({ id: 3, name: "Amanida de llenties amb pastanaga i formatge fresc", ingredients: [
    { name: "Llenties", quantity: 75, unit: "grams" },
    { name: "Pastanaga", quantity: 0.5, unit: "unitat" },
    { name: "Formatge fresc", quantity: 30, unit: "grams" }
  ], desc: "Bulla les llenties durant 20 minuts i escorre-les. Rosteeix la pastanaga al forn durant 20 minuts i barreja-la amb les llenties. Afegeix el formatge fresc esmicolat per sobre.",
    time: "40 min" });
  store.addRecipe({ id: 4, name: "Amanida de quinoa amb alvocat i tonyina", ingredients: [
    { name: "Quinoa", quantity: 75, unit: "grams" },
    { name: "Alvocat", quantity: 0.5, unit: "unitat" },
    { name: "Tonyina", quantity: 0.5, unit: "llauna" }
  ], desc: "Bulla la quinoa durant 10 minuts i escorre-la. Barreja-la amb l'alvocat tallat i la tonyina. Afegeix",
    time: "15 min" });


}


