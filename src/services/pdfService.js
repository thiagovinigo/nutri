import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Inicializa o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Lê um arquivo PDF File e extrai todo o texto contido nele.
 * @param {File} file - Arquivo PDF enviado via input
 * @returns {Promise<string>} - Texto cru extraído de todas as páginas
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Carrega o documento PDF
    const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
    const pdf = await loadingTask.promise;
    
    let fullText = '';

    // Itera por todas as páginas
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Concatena os itens de texto da página
      const pageText = textContent.items.map(item => item.str).join(' ');
      
      fullText += `[Página ${pageNum}]\n${pageText}\n\n`;
    }

    return fullText.trim();
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    throw new Error(`Falha ao ler o PDF (${error.message || 'erro desconhecido'}). Se o arquivo for válido, pode ser uma imagem escaneada sem texto extraível.`);
  }
}
