const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const users = []; // Exemplo de armazenamento de usuários (use um banco de dados em produção)
const JWT_SECRET = 'xyz_abc'; // Use uma chave secreta segura

// Configuração da conexão MySQL
const db = mysql.createConnection({
  host: 'localhost',    // Use o nome do serviço no docker-compose ou 'localhost' se estiver rodando localmente
  user: 'ciclo-usr',
  password: 'ciclo-usr_password',
  database: 'auth_db',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL');
});

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou use outro serviço como Outlook
  auth: {
    user: 'devmmbr@gmail.com', // substitua com o seu e-mail
    pass: 'ynvd sxik ifyn velk',           // substitua com a sua senha
  },
});


// Rota de login para autenticar o usuário e gerar um token JWT
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'E-mail ou senha incorretos.' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.senha);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

app.post('/api/verifyCodeAuth', async (req, res) => {
  const { email, code } = req.body;

  const query = 'SELECT * FROM auth_codes WHERE email = ? AND code = ?';
  db.query(query, [email, code], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      res.status(500).json({ message: 'Erro interno' });
      return;
    }

    if (results.length > 0) {
      // Código encontrado e válido
      console.log("Código válido!");
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
  
    }else {
      // Código não encontrado ou inválido
      console.log("Código INválido!");
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  });

});


// Middleware para verificar o token JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(403);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições por IP
});

// Rota protegida para exemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Acesso autorizado!' });
});

// Rota para enviar o código e armazená-lo no banco de dados
app.post('/api/send-code', (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos

  // Salvar o código no banco de dados
  const query = 'INSERT INTO auth_codes (email, code) VALUES (?, ?)';
  db.query(query, [email, code], (err) => {
    if (err) {
      console.error('Erro ao salvar o código no banco de dados:', err);
      res.status(500).json({ message: 'Erro interno ao salvar o código' });
      return;
    }

    const emailBody = `<font size="20">${code}</font>`;

    // Configuração do e-mail com o código
    const mailOptions = {
      from: 'devmmbr@gmail.com',
      to: email,
      subject: 'Seu Código de Autenticação',
      text: emailBody,
      //text: `<h3>Seu código de autenticação é: <b>${code}</b></h3>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar o e-mail:', error);
        res.status(500).json({ message: 'Erro ao enviar o e-mail' });
      } else {
        console.log('E-mail enviado:', info.response);
        res.json({ message: 'Código enviado com sucesso!' });
      }
    });
  });
});

//app.use('/api/check-registration', authenticateToken, apiLimiter);
app.use('/api/verify-code', authenticateToken, apiLimiter);

// Rota para validar o código
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  console.log("codigo: " + code );
  const query = 'SELECT * FROM auth_codes WHERE email = ? AND code = ?';
  db.query(query, [email, code], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      res.status(500).json({ message: 'Erro interno' });
      return;
    }

    if (results.length > 0) {
      // Código encontrado e válido
      console.log("Código válido!");
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
      //res.json({ message: 'Código válido!' });
    } else {
      // Código não encontrado ou inválido
      console.log("Código INválido!");
      res.status(400).json({ message: 'Código inválido ou expirado' });
    }
  });
});

// Rota de registro de usuário
app.post('/api/register', async (req, res) => {
  const { email, nome, cpf, data_nascimento, senha } = req.body;
  const hashedPassword = await bcrypt.hash(senha, 10);

  const query = 'INSERT INTO users (email, nome, cpf, data_nascimento, senha) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [email, nome, cpf, data_nascimento, hashedPassword], (err, result) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  });
});

app.get('/api/check-registration', (req, res) => {
  const { email } = req.query;

  const query = 'SELECT cadastro_completo FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno' });
    }

    if (results.length === 0) {
      console.log("Usuario nao encontrado: [" + email + "]");
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const cadastroCompleto = results[0].cadastro_completo;
    console.log("CadastroCompleto:"+cadastroCompleto);
    res.json({ cadastroCompleto });
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});