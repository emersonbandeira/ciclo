const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const users = []; // Exemplo de armazenamento de usuários (use um banco de dados em produção)
const JWT_SECRET = 'sua_chave_secreta'; // Use uma chave secreta segura

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
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (user && (await bcrypt.compare(password, user.password))) {
    // Gera o token JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
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

    const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
      <h2 style="text-align: center; color: #4CAF50;">Verificação de Conta</h2>
      <p>Olá,</p>
      <p>Para completar seu login, por favor, use o código de verificação abaixo:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px dashed #4CAF50; border-radius: 8px;">${code}</span>
      </div>
      <p>Este código expira em 10 minutos.</p>
      <p style="margin-top: 20px;">Se você não solicitou este código, por favor, ignore este e-mail.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">Atenciosamente, <br>Equipe do Suporte</p>
    </div>
  `;

    // Configuração do e-mail com o código
    const mailOptions = {
      from: 'seu-email@gmail.com',
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


// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});