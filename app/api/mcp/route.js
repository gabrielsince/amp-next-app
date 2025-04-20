// app/api/mcp/route.js
import { NextResponse } from "next/server";
import { tools } from "../../../mcpServer.mjs"; // 确保路径正确

export async function POST(request) {
  try {
    const { toolName, arguments: args } = await request.json();
    
    // 检查工具是否存在
    if (!tools || !tools[toolName]) {
      return NextResponse.json({ error: `工具 ${toolName} 未找到` }, { status: 400 });
    }

    // 执行工具的 handler
    const result = await tools[toolName].handler(args);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("POST 请求错误:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}