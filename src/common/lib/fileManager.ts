import fs from "node:fs";
import path from "node:path";

// biome-ignore lint/complexity/noStaticOnlyClass: This is a utility class
export default class FileManager {
	public static FOLDER_UPLOADS = "uploads";

	static async upload(folder: string, file: File): Promise<string> {
		const cleaned = path
			.parse(path.basename(file.name))
			.name.replaceAll(/[^\w -]/g, "")
			.replaceAll(/\s+/g, "_");

		const timestamp = Date.now();
		const newFilename = `${cleaned}_${timestamp}`;
		const newFilepath = `${FileManager.FOLDER_UPLOADS}/${folder}/${newFilename}${path.extname(file.name)}`;

		const dir = path.dirname(newFilepath);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		fs.writeFileSync(newFilepath, buffer);

		return newFilepath;
	}

	static async remove(filePath: string): Promise<void> {
		if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
	}
}
