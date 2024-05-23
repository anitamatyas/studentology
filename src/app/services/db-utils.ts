export function convertSnaps<T>(results) {
    return results.map(action => {
        const data = action.payload.doc.data() as T;
        const id = action.payload.doc.id;
        return { id, ...data };
    });
}

export function convertSnap<T>(result) {
    const data = result.payload.data() as T;
    const id = result.payload.id;
    return { id, ...data };
}