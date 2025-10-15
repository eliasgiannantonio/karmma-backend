import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificar conexión del transportador
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al configurar el transportador de email:', error);
  } else {
    console.log('✅ Servidor de email listo');
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'KARMMA API funcionando correctamente 🎵' });
});

// Ruta para enviar email de contacto
app.post('/api/contact', async (req, res) => {
  try {
    const { nombre, email, servicio, mensaje } = req.body;

    // Validaciones
    if (!nombre || !email || !servicio || !mensaje) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son obligatorios' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email inválido' 
      });
    }

    // Configurar email para KARMMA
    const mailOptionsToKarmma = {
      from: process.env.EMAIL_USER,
      to: 'karmma016@gmail.com',
      subject: `🎵 Nuevo contacto de ${nombre} - ${servicio}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .field label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
            .field value { background: white; padding: 10px; display: block; border-radius: 5px; border: 1px solid #ddd; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Nuevo Mensaje de Contacto</h1>
            </div>
            <div class="content">
              <div class="field">
                <label>👤 Nombre:</label>
                <value>${nombre}</value>
              </div>
              <div class="field">
                <label>📧 Email:</label>
                <value>${email}</value>
              </div>
              <div class="field">
                <label>🎵 Servicio de Interés:</label>
                <value>${servicio}</value>
              </div>
              <div class="field">
                <label>💬 Mensaje:</label>
                <value>${mensaje}</value>
              </div>
            </div>
            <div class="footer">
              <p>Este email fue enviado desde el formulario de contacto de KARMMA</p>
              <p>Para responder, contactá directamente a: ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Configurar email de confirmación para el cliente
    const mailOptionsToClient = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎵 Gracias por contactar a KARMMA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta { background: linear-gradient(135deg, #fbbf24 0%, #ef4444 50%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; display: inline-block; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Gracias por contactarnos!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Recibimos tu mensaje sobre <strong>${servicio}</strong> y nos pondremos en contacto con vos en las próximas 24 horas.</p>
              <p>Mientras tanto, podés:</p>
              <ul>
                <li>📱 Escribirnos por WhatsApp: <a href="https://wa.me/5493534297565">+54 9 353 429-7565</a></li>
                <li>📸 Seguirnos en Instagram: <a href="https://www.instagram.com/karmma.prod/">@karmma.prod</a></li>
                <li>🎵 Ver nuestro portfolio en YouTube</li>
              </ul>
              <p style="margin-top: 30px;"><strong>Tu consulta:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24;">${mensaje}</p>
              <center>
                <a href="https://www.instagram.com/karmma.prod/" class="cta">Seguinos en Instagram</a>
              </center>
            </div>
            <div class="footer">
              <p><strong>KARMMA - Producciones de Verdad</strong></p>
              <p>Villa María, Córdoba, Argentina</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Enviar ambos emails
    await transporter.sendMail(mailOptionsToKarmma);
    await transporter.sendMail(mailOptionsToClient);

    console.log(`✅ Email enviado de: ${nombre} (${email})`);

    res.status(200).json({ 
      success: true, 
      message: 'Mensaje enviado correctamente. ¡Te contactaremos pronto!' 
    });

  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al enviar el mensaje. Por favor intentá nuevamente.' 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});