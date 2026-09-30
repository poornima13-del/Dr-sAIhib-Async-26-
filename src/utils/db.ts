import { PatientProfile, CheckRecord, AshaContact, AppSettings } from '../types';
import { CONDITIONS_LIST } from '../data/knowledgeBase';

const DB_NAME = 'DrSAIhibDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  // Request persistent storage so browser does not clear offline data
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log('Storage persisted:', isPersisted);
    } catch (e) {
      console.warn('Storage persist request ignored:', e);
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('checks')) {
          const checkStore = db.createObjectStore('checks', { keyPath: 'id' });
          checkStore.createIndex('date', 'date', { unique: false });
          checkStore.createIndex('patientName', 'patientName', { unique: false });
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('knowledgeBase')) {
          db.createObjectStore('knowledgeBase', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };

      request.onsuccess = async (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        await seedDefaultData(dbInstance);
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    } catch (err) {
      console.error('IndexedDB initialization failed:', err);
      reject(err);
    }
  });
}

async function seedDefaultData(db: IDBDatabase) {
  // Seed default settings if empty
  const settings = await getSettings();
  if (!settings) {
    await saveSettings({
      language: 'en',
      fontSize: 'normal',
      highContrast: false,
      darkMode: false,
      ashaPin: '1234'
    });
  }

  // Seed default ASHA contacts if empty
  const contacts = await getAshaContact();
  if (!contacts) {
    await saveAshaContact({
      ashaName: 'Radha Devi (ASHA Didi)',
      ashaPhone: '9876543210',
      village: 'Gram Panchayat Shanti Nagar',
      doctorName: 'Dr. Ramesh Sharma',
      doctorPhone: '9811223344',
      phcName: 'Primary Health Centre (PHC)',
      phcPhone: '104',
      familyPhone: ''
    });
  }

  // Seed knowledge base if empty
  try {
    const tx = db.transaction('knowledgeBase', 'readwrite');
    const store = tx.objectStore('knowledgeBase');
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        CONDITIONS_LIST.forEach((cond) => store.put(cond));
      }
    };
  } catch (e) {
    console.warn('Seeding knowledge base failed:', e);
  }
}

// Patients store
export async function savePatient(patient: PatientProfile): Promise<string> {
  const db = await initDB();
  const id = patient.id || 'pat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const record = { ...patient, id };

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction('patients', 'readwrite');
      const store = tx.objectStore('patients');
      const req = store.put(record);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function getAllPatients(): Promise<PatientProfile[]> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('patients', 'readonly');
      const store = tx.objectStore('patients');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

// Checks store
export async function saveCheckRecord(check: CheckRecord): Promise<string> {
  const db = await initDB();
  const id = check.id || 'chk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const record = { ...check, id, date: check.date || Date.now() };

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction('checks', 'readwrite');
      const store = tx.objectStore('checks');
      const req = store.put(record);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function getAllChecks(): Promise<CheckRecord[]> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('checks', 'readonly');
      const store = tx.objectStore('checks');
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result || []).sort((a, b) => b.date - a.date);
        resolve(sorted);
      };
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

export async function getCheckById(id: string): Promise<CheckRecord | null> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('checks', 'readonly');
      const store = tx.objectStore('checks');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function updateCheckFollowUp(id: string, notes: string, done: boolean): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('checks', 'readwrite');
      const store = tx.objectStore('checks');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = { ...getReq.result, followUpNotes: notes, followUpDone: done };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(true);
          putReq.onerror = () => resolve(false);
        } else {
          resolve(false);
        }
      };
      getReq.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

export async function deleteCheck(id: string): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('checks', 'readwrite');
      const store = tx.objectStore('checks');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

// Contacts store
export async function getAshaContact(): Promise<AshaContact | null> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('contacts', 'readonly');
      const store = tx.objectStore('contacts');
      const req = store.get('primary_contact');
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function saveAshaContact(contact: AshaContact): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('contacts', 'readwrite');
      const store = tx.objectStore('contacts');
      const req = store.put({ id: 'primary_contact', data: contact });
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

// Settings store
export async function getSettings(): Promise<AppSettings | null> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('app_settings');
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function saveSettings(settings: AppSettings): Promise<boolean> {
  const db = await initDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ id: 'app_settings', data: settings });
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

// Export & Import
export async function exportAllData(): Promise<string> {
  const patients = await getAllPatients();
  const checks = await getAllChecks();
  const contact = await getAshaContact();
  const settings = await getSettings();

  const exportPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'Dr SAIhib',
    patients,
    checks,
    contact,
    settings
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function importAllData(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    const db = await initDB();

    if (Array.isArray(data.patients)) {
      const tx = db.transaction('patients', 'readwrite');
      const store = tx.objectStore('patients');
      data.patients.forEach((p: PatientProfile) => store.put(p));
    }

    if (Array.isArray(data.checks)) {
      const tx = db.transaction('checks', 'readwrite');
      const store = tx.objectStore('checks');
      data.checks.forEach((c: CheckRecord) => store.put(c));
    }

    if (data.contact) {
      await saveAshaContact(data.contact);
    }

    if (data.settings) {
      await saveSettings(data.settings);
    }

    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}
