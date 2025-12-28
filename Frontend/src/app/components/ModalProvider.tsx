"use client";

import { useModalStore } from "../stores/modalStore";
import { QuickViewModal } from "./QuickViewModal";

export function ModalProvider() {
    const { quickViewProduct, closeQuickView } = useModalStore();

    return (
        <>
            <QuickViewModal
                product={quickViewProduct}
                onClose={closeQuickView}
            />
        </>
    );
}
