//INVOCANDO EXPRESS
const express = require('express');
const app = express();

//SETEANDO URLENCODE PARA CAPTURAR FORM
app.use(express.urlencoded({extended:false}));
app.use(express.json())

//INVOCANDO DATENV
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'})

//SETEANDO EL DIR PUBLIC
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//ESTABLECIENDO EL MOTOR DE PLANTILLAS
app.set('view engine','ejs');

//INVONCANDO BCRYPT.JS
const bcryptjs = require('bcryptjs');

//VAR SESION
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true,
}));

//INVOCANDO AL MÓDULO DE CONEXIÓN DE LA BD
const connection = require('./db/db');
const { renderFile } = require('ejs');

//ESTABLECIENDO LAS RUTAS
app.get('/', (req, res) =>{
    res.render('index');
})

app.get('/login', (req, res) =>{
    res.render('login');
})

app.get('/registro', (req, res) =>{
    res.render('registro');
})

app.get('/dashboard', (req, res) =>{
    res.render('panel');
})

//EJECUCIÓN
app.post('/registrar', async (req, res) =>{
    const usuario = req.body.usuario;
    const correoe = req.body.correoe;
    const passw = req.body.passw;
    
  
    
    connection.query('INSERT INTO users SET ?', {user:usuario, correo:correoe, pass:passw}, async(error, results)=>{
        if(error){
            console.log(error);
        } else {
            res.render('registro',{
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro Satisfactorio!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta:'',
            })
        }
    })
})




//AUTENTICACIÓN DE INICIO DE SESIÓN
app.post('/auth', async (req, res)=>{
    const correo = req.body.correo;
    const pass = req.body.pass;
    
    if(correo && pass){
        connection.query('SELECT * FROM users WHERE correo = ?', [correo], async (error, results, fields)=>{
            if( results.length == 0 || results ==! (await bcryptjs.compare(pass, results[0].pass)) ){    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "CORREO y/o CONTRASEÑA incorrectos",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login' 
                    })
                    
							
			} else {    
                req.session.loggedin = true;
                req.session.name = results[0].name;
                res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: 'dashboard'
				});   
                
            }
            res.end();
        } )
    } 
})

//CONTROLANDO AUTENTIFICACIÓN EN TODAS LAS PÁGINAS
app.get('/', (req, res)=> {
	if (req.session) {
		res.render('index',{
			login: true,
			name: req.session			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});


//LIMPIEZA DE CACHÉ
app.use(function(req, res, next) {
    if (req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

//LOGOUT
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});



//console.log(__dirname);

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNINNG IN http://localhost:3000')
})