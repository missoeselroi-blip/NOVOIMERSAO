// Firebase Mock for offline/local-storage mode

// --- AUTH MOCK ---
export const initializeApp = () => ({});
export const getAuth = () => {
    try {
        const localUser = localStorage.getItem('mock_user');
        return { currentUser: localUser ? JSON.parse(localUser) : null, name: 'auth' };
    } catch {
        return { currentUser: null, name: 'auth' };
    }
};
export const onAuthStateChanged = (auth, cb) => {
    try {
        const localUser = localStorage.getItem('mock_user');
        cb(localUser ? JSON.parse(localUser) : null);
    } catch {
        cb(null);
    }
    return () => {};
};
export const signInWithPopup = async () => {
    const user = { uid: 'local-admin', email: 'missoeselroi@gmail.com', displayName: 'Administrador Local', photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin` };
    localStorage.setItem('mock_user', JSON.stringify(user));
    window.location.reload();
    return { user };
};
export class GoogleAuthProvider {}
export const signOut = async () => {
    localStorage.removeItem('mock_user');
    window.location.reload();
};
export const signInWithEmailAndPassword = async () => { throw new Error("Não suportado no modo offline"); };
export const createUserWithEmailAndPassword = async () => { throw new Error("Não suportado no modo offline"); };
export const updateProfile = async () => {};

// --- STORAGE MOCK ---
export const getStorage = () => ({});
export const ref = () => ({});
export const getDownloadURL = async () => { throw new Error("Modo offline não suporta Storage"); };
export const listAll = async () => ({ items: [], prefixes: [] });
export const uploadBytes = async () => ({});
export const deleteObject = async () => {};

// --- FIRESTORE MOCK ---
export const isProjectSuspended = { value: false, subscribe: () => ()=>{} };

const getDB = () => {
    try {
        return JSON.parse(localStorage.getItem('mock_db') || '{}');
    } catch {
        return {};
    }
};
const saveDB = (db) => localStorage.setItem('mock_db', JSON.stringify(db));

const listeners = new Set();
const notify = (path) => {
    listeners.forEach(l => l(path));
};

export const initializeFirestore = () => ({});
export const getDocFromServer = async (docRef) => getDoc(docRef);

export const collection = (db, path, ...rest) => {
    if (typeof path === 'string') {
        const fullPath = [path, ...rest].join('/');
        return { type: 'collection', path: fullPath };
    }
    if (typeof db === 'string') return { type: 'collection', path: db };
    return { type: 'collection', path };
};

export const doc = (db, path, ...rest) => {
    if (db && db.type === 'collection') {
        return { type: 'doc', path: [db.path, path, ...rest].join('/') };
    }
    if (typeof path === 'string') {
        return { type: 'doc', path: [path, ...rest].join('/') };
    }
    return { type: 'doc', path: String(path) };
};

export const query = (collRef, ...ops) => ({ ...collRef, ops });
export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, dir) => ({ type: 'orderBy', field, dir });
export const limit = (n) => ({ type: 'limit', n });
export const increment = (n) => ({ type: 'increment', n });
export const arrayUnion = (...elements) => ({ type: 'arrayUnion', elements });
export const arrayRemove = (...elements) => ({ type: 'arrayRemove', elements });

const applyTransformers = (currentData, newData) => {
    const result = { ...currentData };
    for (const key in newData) {
        const val = newData[key];
        if (val && typeof val === 'object' && val.type) {
            if (val.type === 'increment') {
                result[key] = (result[key] || 0) + val.n;
            } else if (val.type === 'arrayUnion') {
                const arr = result[key] || [];
                result[key] = [...new Set([...arr, ...val.elements])];
            } else if (val.type === 'arrayRemove') {
                const arr = result[key] || [];
                result[key] = arr.filter(v => !val.elements.includes(v));
            } else {
                result[key] = val;
            }
        } else {
            result[key] = val;
        }
    }
    return result;
};

export const setDoc = async (docRef, data) => {
    const db = getDB();
    db[docRef.path] = applyTransformers({}, data);
    saveDB(db);
    notify(docRef.path);
};

export const addDoc = async (collRef, data) => {
    const id = Math.random().toString(36).substring(2, 15);
    const path = collRef.path + '/' + id;
    const db = getDB();
    db[path] = applyTransformers({}, { ...data, id, createdAt: new Date().toISOString() });
    saveDB(db);
    notify(collRef.path); 
    return { id, path, type: 'doc' };
};

export const updateDoc = async (docRef, data) => {
    const db = getDB();
    const existing = db[docRef.path] || {};
    db[docRef.path] = applyTransformers(existing, data);
    saveDB(db);
    notify(docRef.path);
};

export const deleteDoc = async (docRef) => {
    const db = getDB();
    delete db[docRef.path];
    saveDB(db);
    notify(docRef.path);
};

export const getDoc = async (docRef) => {
    const db = getDB();
    const data = db[docRef.path];
    return {
        exists: () => !!data,
        data: () => data,
        id: docRef.path.split('/').pop(),
        ref: docRef
    };
};

export const getDocs = async (queryRef) => {
    const db = getDB();
    const collPrefix = queryRef.path + '/';
    const allKeys = Object.keys(db).filter(k => k.startsWith(collPrefix) && k.split('/').length === collPrefix.split('/').length);
    
    let docs = allKeys.map(k => ({
        id: k.split('/').pop(),
        data: () => db[k],
        ref: { type: 'doc', path: k }
    }));

    if (queryRef.ops) {
        for (const op of queryRef.ops) {
            if (op.type === 'where') {
                docs = docs.filter(d => {
                    if (op.op === '==') return d.data()[op.field] === op.value;
                    return true;
                });
            }
        }
    }
    
    return { 
        docs, 
        size: docs.length,
        empty: docs.length === 0,
        forEach: (cb) => docs.forEach(cb)
    };
};

export const onSnapshot = (ref, cb, err) => {
    const trigger = async () => {
        try {
            if (ref.type === 'doc') {
                const docSnap = await getDoc(ref);
                cb(docSnap);
            } else {
                const docsSnap = await getDocs(ref);
                cb(docsSnap);
            }
        } catch (error) {
            if (err) err(error);
        }
    };
    trigger();
    
    const listener = (changedPath) => {
        if (ref.type === 'doc' && changedPath === ref.path) trigger();
        if (ref.type === 'collection' && changedPath.startsWith(ref.path)) trigger();
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const serverTimestamp = () => new Date().toISOString();
export const Timestamp = {
    now: () => ({ toDate: () => new Date() }),
    fromDate: (d) => ({ toDate: () => d }),
};

export const writeBatch = () => {
    const db = getDB();
    return {
        set: (docRef, data) => { db[docRef.path] = applyTransformers({}, data); notify(docRef.path); },
        update: (docRef, data) => { db[docRef.path] = applyTransformers(db[docRef.path] || {}, data); notify(docRef.path); },
        delete: (docRef) => { delete db[docRef.path]; notify(docRef.path); },
        commit: async () => saveDB(db)
    };
};

export const runTransaction = async (db, cb) => {
    const transaction = {
        get: async (docRef) => getDoc(docRef),
        set: (docRef, data) => setDoc(docRef, data),
        update: (docRef, data) => updateDoc(docRef, data),
        delete: (docRef) => deleteDoc(docRef),
    };
    return await cb(transaction);
};

export const auth = getAuth();
export const db = initializeFirestore();
export const storage = getStorage();
export const app = initializeApp();

export default app;
