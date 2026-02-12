import { GoogleGenAI } from "@google/genai";

export const convertDocumentToMarkdown = async (
  fileBase64: string, 
  mimeType: string,
  onProgress: (msg: string) => void
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("缺少 API 密钥。请检查您的环境配置。");
  }

  onProgress("正在初始化 AI...");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Determine prompt based on document type intent
  const systemInstruction = `
    You are an expert document converter and structural analyst. 
    Your task is to convert the provided document (PDF or Image) into clean, semantic Markdown.
    
    Rules:
    1. Preserve all headers (#, ##, ###).
    2. Convert tables into Markdown tables.
    3. Extract list items accurately.
    4. Do not wrap the output in a markdown code block (e.g., no \`\`\`markdown). Return raw markdown text.
    5. Ignore page numbers, headers, and footers that are repetitive.
    6. If there are images, describe them briefly in italic text like *[Image: description]*.
    7. Maintain the reading order strictly.
  `;

  onProgress("正在上传并分析文档...");
  
  try {
    // Switching to gemini-2.0-flash as it is the current stable multimodal model
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: "Convert this document into a comprehensive Markdown format. Ensure headers are correctly hierarchized for a Table of Contents."
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for high fidelity
      }
    });

    onProgress("正在生成结果...");
    
    const text = response.text;
    if (!text) {
      throw new Error("模型未生成任何内容。");
    }
    return text;

  } catch (error) {
    console.error("Gemini Conversion Error:", error);
    // Enhance error message for common issues
    let errorMessage = error instanceof Error ? error.message : "转换过程中发生未知错误";
    
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      errorMessage = "模型未找到 (404)。请检查 API Key 权限或模型名称是否正确。";
    } else if (errorMessage.includes("400")) {
      errorMessage = "请求无效 (400)。可能是文件格式不受支持或文件过大。";
    } else if (errorMessage.includes("403")) {
      errorMessage = "权限被拒绝 (403)。请检查 API Key 是否有效。";
    }

    throw new Error(errorMessage);
  }
};