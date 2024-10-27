const express = require('express');
const router = require('./routes/index.routes');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');
const http = require('http'); 
const { DataBaseUser } = require('./config/DB/DataBaseConnection');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {


    cors: {
        origin: '*', 
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true
    }

});

io.on('connection', (socket) => {
    console.log('usuario se ha conectado al chat');
    socket.on('message', (msg) => {
        console.log('Usuario:', msg);  
        io.emit('message', msg);
    });
    socket.on('disconnect', () => {
        console.log('usuario se ha desconectado del chat');
    });
});



function generarToken(user) {
    return jwt.sign(user, process.env.SECRET, { expiresIn: '33m' });
}

async function authUser(username, password) {
    try {
        const db = await DataBaseUser(); 
        if (!db) throw new Error("Conexión a la base de datos fallida");

        const usuariosCollection = db.collection('usuario');
        const user = await usuariosCollection.findOne({ usuario: username, pass: password });
        
        if (user) {
            return { success: true, message: "El usuario se ha autenticado exitosamente" };
        } else {
            return { success: false, message: "Credenciales incorrectas" };
        }
    } catch (error) {
        console.error("Error al autenticar usuario:", error);
        throw new Error("Error de autenticación");
    }
}


async function registerUser(username, password) {
    try {
        const db = await DataBaseUser();
        if (!db) throw new Error("Conexión a la base de datos fallida");
        const usuariosCollection = db.collection('usuario');
        const existingUser = await usuariosCollection.findOne({ usuario: username });
        if (existingUser) {
            return { success: false, message: "El usuario ya existe" };
        }
        const newUser = { usuario: username, pass: password };
        await usuariosCollection.insertOne(newUser);
        return { success: true, message: "Usuario registrado exitosamente" };
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        throw new Error("Error en el registro de usuario");
    }
}



app.post('/auth', async (req, res) => {
    const { username, password } = req.body;
    const authResult = await authUser(username, password);
    if (authResult.success) {
        const user = { password: password };
        const token = generarToken(user);
        res.header('authorization', token).json({
            message: 'usuario ha autenticado exitosamente, copia el token para acceder a /home?token=<token>',
            token: token
        });
    } else {
        res.json({ message: authResult.message });
    }
});


function validacionToken(req, res, next) {
    const token = req.header['authorization'] || req.query.token;
   
    if (!token) return res.send('Acceso denegado');
    
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            return res.send('acceso denegado: el  token expirado o  es incorrecto');
        } else {
            next();
        }
    });
}


app.use('/', router);
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './login.html'));
});

app.get('/home', validacionToken, (req, res) => {
    res.sendFile(path.join(__dirname, './home.html'));
});

app.get('/registrar', (req, res) => {
    res.sendFile(path.join(__dirname, './registrar.html'));
});

app.post('/registrarUsuario', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    try {
        const result = await registerUser(username, password);
        if (result) {
            res.json({
                message: 'usuario ha autenticado exitosamente, dirigete a http://localhost:3000/login  para iniciar sesión',
                
            });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el registro" });
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Socket.io & Servidor activo en el puerto: ---->${port}`);
});
