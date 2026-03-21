import jsPDF from 'jspdf';

export const generateCertificate = (userName: string, totalHours: number, averageGrade: number) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // Background/Border
  doc.setDrawColor(16, 185, 129); // Emerald-600
  doc.setLineWidth(5);
  doc.rect(5, 5, 287, 200);

  // Title
  doc.setFontSize(40);
  doc.setTextColor(16, 185, 129);
  doc.text('CERTIFICADO DE CONCLUSÃO', 148, 40, { align: 'center' });

  // Body
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Certificamos que', 148, 70, { align: 'center' });
  
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text(userName.toUpperCase(), 148, 90, { align: 'center' });

  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text('concluiu com êxito o Curso de Teologia Básica.', 148, 110, { align: 'center' });

  // Details
  doc.setFontSize(16);
  doc.text(`Carga Horária Total: ${totalHours.toFixed(1)} horas`, 148, 130, { align: 'center' });
  doc.text(`Média Final: ${averageGrade.toFixed(1)}`, 148, 140, { align: 'center' });

  // Date
  doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, 148, 160, { align: 'center' });

  // Footer/Signature
  doc.line(80, 180, 210, 180);
  doc.text('Diretoria Teológica', 148, 190, { align: 'center' });

  doc.save(`Certificado_${userName.replace(/\s+/g, '_')}.pdf`);
};
