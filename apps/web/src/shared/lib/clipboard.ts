import toast from "react-hot-toast";

export async function writeToClipboard(value: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(value);
		return true;
	} catch {
		return false;
	}
}

/** For places that cannot show feedback in place, such as a menu item that closes on click. */
export async function copyToClipboard(value: string, successMessage: string) {
	if (await writeToClipboard(value)) {
		toast.success(successMessage);
		return;
	}

	toast.error("Could not copy to clipboard");
}
