import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  // eslint-disable-next-line comma-dangle
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({
    mensaje: 'Hola desde Funciones de Firebase!!!!',
  });
});

export const getGOTY = functions.https.onRequest(async (request, response) => {
  // const nombre = 'Fernando';
  const gotyRef = db.collection('goty');
  const docSnap = await gotyRef.get();
  const juegos = docSnap.docs.map( (doc) => doc.data());

  response.json(juegos);
});

// Express
const app = express();
app.use(cors({origin: true}));

app.get('/goty', async (req, res)=>{
  const gotyRef = db.collection('goty');
  const docSnap = await gotyRef.get();
  const juegos = docSnap.docs.map( (doc) => doc.data());

  res.json(juegos);
});

app.post('/goty/:id', async (req, res)=> {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();

  if (!gameSnap.exists) {
    res.status(404).json({
      ok: false,
      mensaje: 'No existe un juego con ese Id ' + id,
    });
  } else {
    const antes = gameSnap.data() || {votos: 0};
    await gameRef.update({
      votos: antes.votos + 1,
    });
    res.json({
      ok: true,
      mensaje: `Gracias por tu voto a ${antes.name}`,
    });
  }
});


export const api = functions.https.onRequest(app);
