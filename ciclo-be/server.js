const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());
app.use(cors());

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

    // Configuração do e-mail com o código
    const mailOptions = {
      from: 'seu-email@gmail.com',
      to: email,
      subject: 'Seu Código de Autenticação',
      text: `Seu código de autenticação é: ${code}`,
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
      res.json({ message: 'Código válido!' });
    } else {
      // Código não encontrado ou inválido
      res.status(400).json({ message: 'Código inválido ou expirado' });
    }
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});