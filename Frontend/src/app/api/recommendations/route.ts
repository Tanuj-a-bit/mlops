import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const itemId = searchParams.get("itemId");

    if (!userId && !itemId) {
        return NextResponse.json({ error: "Missing userId or itemId" }, { status: 400 });
    }

    const mode = userId ? "user" : "item";
    const targetId = userId || itemId;

    // Assuming python3 is available in the environment
    // Path to python script: Project Root -> ml/recommend.py
    // Current file: Frontend/src/app/api/recommendations/route.ts
    // We need to resolve to /Users/tanujs/Desktop/mlops/ml/recommend.py

    // Hardcoding absolute path for stability in this environment, or resolving relative to cwd
    const scriptPath = path.resolve(process.cwd(), "../ml/recommend.py");

    return new Promise<NextResponse>((resolve) => {
        const pythonProcess = spawn("python3", [scriptPath, mode, targetId!]);

        let dataString = "";
        let errorString = "";

        pythonProcess.stdout.on("data", (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            errorString += data.toString();
        });

        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                console.error("Python script error:", errorString);
                resolve(NextResponse.json({ error: "Recommendation failed", details: errorString }, { status: 500 }));
            } else {
                try {
                    // Find the last line that looks like JSON, in case of "Building content-based model..." logs
                    const lines = dataString.trim().split('\n');
                    const jsonLine = lines[lines.length - 1];
                    const results = JSON.parse(jsonLine);
                    resolve(NextResponse.json(results));
                } catch (e) {
                    console.error("JSON parse error", e, dataString);
                    resolve(NextResponse.json({ error: "Invalid response from model" }, { status: 500 }));
                }
            }
        });
    });
}
