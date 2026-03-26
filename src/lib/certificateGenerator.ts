import jsPDF from 'jspdf';

export const generateCertificate = (userName: string, totalHours: number, averageGrade: number) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // Background/Border - Structured Design
  doc.setDrawColor(16, 185, 129); // Emerald-600
  doc.setLineWidth(1.5);
  doc.rect(5, 5, 287, 200); // Outer border
  
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 281, 194); // Inner border

  // Corner Accents
  const drawCorner = (x: number, y: number, rotate: number) => {
    doc.saveGraphicsState();
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(2);
    // Draw a small L-shape at corners
    if (rotate === 0) { // Top-left
      doc.line(x, y, x + 15, y);
      doc.line(x, y, x, y + 15);
    } else if (rotate === 90) { // Top-right
      doc.line(x, y, x - 15, y);
      doc.line(x, y, x, y + 15);
    } else if (rotate === 180) { // Bottom-right
      doc.line(x, y, x - 15, y);
      doc.line(x, y, x, y - 15);
    } else if (rotate === 270) { // Bottom-left
      doc.line(x, y, x + 15, y);
      doc.line(x, y, x, y - 15);
    }
    doc.restoreGraphicsState();
  };

  drawCorner(10, 10, 0);
  drawCorner(287, 10, 90);
  drawCorner(287, 200, 180);
  drawCorner(10, 200, 270);

  // Logo Placeholder (Text-based)
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text('IMERSÃO BÍBLICA IA', 148, 20, { align: 'center' });

  // Title
  doc.setFontSize(42);
  doc.setTextColor(16, 185, 129);
  doc.setFont('times', 'bold');
  doc.text('CERTIFICADO DE CONCLUSÃO', 148, 45, { align: 'center' });

  // Body
  doc.setFontSize(22);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificamos solenemente que', 148, 75, { align: 'center' });
  
  doc.setFontSize(36);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(userName.toUpperCase(), 148, 95, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('concluiu com excelência acadêmica e dedicação espiritual o', 148, 115, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('CURSO DE TEOLOGIA BÁSICA', 148, 125, { align: 'center' });

  // Details Section
  doc.setDrawColor(230, 230, 230);
  doc.line(60, 135, 236, 135);

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(`CARGA HORÁRIA: ${totalHours.toFixed(0)} HORAS DE ESTUDO`, 148, 148, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`Média Final Alcançada: ${averageGrade.toFixed(1)}`, 148, 158, { align: 'center' });

  // Date
  doc.setFontSize(14);
  doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, 148, 172, { align: 'center' });

  // Signatures
  // Left: App Imersão Digital Signature
  doc.setFontSize(12);
  doc.setFont('courier', 'italic');
  doc.text('Assinatura Digital: APP_IMERSAO_IA_' + Math.random().toString(36).substring(7).toUpperCase(), 75, 188, { align: 'center' });
  doc.setDrawColor(150, 150, 150);
  doc.line(40, 190, 110, 190);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Selo de Autenticidade Digital', 75, 195, { align: 'center' });

  // Right: Theology Director
  doc.setFont('times', 'italic');
  doc.setFontSize(16);
  doc.text('Diretoria Teológica', 221, 188, { align: 'center' });
  doc.line(186, 190, 256, 190);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Coordenação de Ensino', 221, 195, { align: 'center' });

  // Decorative Seal
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.circle(148, 188, 8);
  doc.setFontSize(8);
  doc.text('IA', 148, 189, { align: 'center' });

  doc.save(`Certificado_${userName.replace(/\s+/g, '_')}.pdf`);
};
