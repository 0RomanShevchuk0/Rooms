"use client";

import { useCallback, useState } from "react";

function readStored(storageKey: string, defaultValue: boolean): boolean {
	// Guards against being called while rendering on the server, where there is
	// no `window` — today every caller mounts in the browser only.
	if (typeof window === "undefined") return defaultValue;

	try {
		const stored = window.localStorage.getItem(storageKey);
		return stored === null ? defaultValue : stored === "true";
	} catch {
		return defaultValue;
	}
}

/** A per-browser on/off preference. Survives reloads, never leaves the device. */
export function useLocalToggle(storageKey: string, defaultValue: boolean) {
	const [isOn, setIsOn] = useState(() => readStored(storageKey, defaultValue));

	const toggle = useCallback(() => {
		setIsOn((previous) => {
			const next = !previous;
			try {
				window.localStorage.setItem(storageKey, String(next));
			} catch {
				// Nothing to persist to; the choice still applies for this session.
			}
			return next;
		});
	}, [storageKey]);

	return [isOn, toggle] as const;
}
