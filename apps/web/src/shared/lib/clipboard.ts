import toast from "react-hot-toast";

export async function copyToClipboard(value: string, successMessage: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(successMessage);
	} catch {
		toast.error("Could not copy to clipboard");
	}
}
