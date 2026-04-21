import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const getTestsCollection = () => collection(db, 'tests')
const getCustomTestsCollection = (uid) => collection(db, 'users', uid, 'customTests')
const getCompletedTestsCollection = (uid) => collection(db, 'users', uid, 'completedTests')

const normalizeCategory = (value) => (value || '').toString().trim().toLowerCase()

export async function saveUserCustomTest(uid, test) {
  const payload = {
    ...test,
    createdBy: uid,
    category: normalizeCategory(test.category),
    categoryKey: normalizeCategory(test.category),
  }

  const userRef = doc(db, 'users', uid, 'customTests', test.id)

  console.log('[saveTest] Saving to:', userRef.path)
  console.log('[saveTest] Payload size:', JSON.stringify(payload).length, 'bytes')

  // Save to the user's own subcollection (primary & reliable).
  await setDoc(userRef, payload)
  console.log('[saveTest] ✓ Saved to user subcollection')

  // Best-effort mirror to public tests collection.
  // Rules have "allow write: if false" so this will be rejected — that's OK.
  try {
    const publicRef = doc(db, 'tests', test.id)
    await setDoc(publicRef, payload)
    console.log('[saveTest] ✓ Saved to public tests collection')
  } catch (error) {
    console.warn('[saveTest] Public mirror skipped (expected):', error.code || error.message)
  }
}

export async function getUserCustomTests(uid) {
  // Fetch from both sources and merge, deduplicating by ID.
  const testMap = new Map()

  // 1. Try the user's own subcollection first (most reliable).
  try {
    const userSnapshot = await getDocs(getCustomTestsCollection(uid))
    userSnapshot.docs.forEach((entry) => {
      const data = entry.data()
      testMap.set(entry.id, {
        id: entry.id,
        ...data,
        category: normalizeCategory(data.category || data.categoryKey),
      })
    })
  } catch (error) {
    console.warn('Failed to read user custom tests subcollection:', error)
  }

  // 2. Also check the public tests collection for any created by this user.
  try {
    const publicSnapshot = await getDocs(getTestsCollection())
    publicSnapshot.docs.forEach((entry) => {
      const data = entry.data()
      if (data.createdBy === uid) {
        testMap.set(entry.id, {
          id: entry.id,
          ...data,
          category: normalizeCategory(data.category || data.categoryKey),
        })
      }
    })
  } catch (error) {
    console.warn('Failed to read public tests collection:', error)
  }

  return Array.from(testMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
}

export async function getUserCustomTestsByCategory(uid, category) {
  const normalizedCategory = normalizeCategory(category)
  const allTests = await getUserCustomTests(uid)
  return allTests.filter((test) => normalizeCategory(test.category) === normalizedCategory)
}

export async function getCategoryTests(uid, category) {
  const normalizedCategory = normalizeCategory(category)
  const testMap = new Map()

  // 1) User-owned tests from subcollection.
  try {
    const userSnapshot = await getDocs(getCustomTestsCollection(uid))
    userSnapshot.docs.forEach((entry) => {
      const data = entry.data()
      const testCategory = normalizeCategory(data.category || data.categoryKey)
      if (testCategory !== normalizedCategory) {
        return
      }

      testMap.set(entry.id, {
        id: entry.id,
        ...data,
        category: testCategory,
        isUserTest: true,
      })
    })
  } catch (error) {
    console.warn('Failed to read category tests from user subcollection:', error)
  }

  // 2) Public tests collection (if readable by rules).
  try {
    const publicSnapshot = await getDocs(getTestsCollection())
    publicSnapshot.docs.forEach((entry) => {
      const data = entry.data()
      const testCategory = normalizeCategory(data.category || data.categoryKey)
      if (testCategory !== normalizedCategory) {
        return
      }

      // Preserve any user-subcollection version if already present.
      if (!testMap.has(entry.id)) {
        testMap.set(entry.id, {
          id: entry.id,
          ...data,
          category: testCategory,
          isUserTest: data.createdBy === uid,
        })
      }
    })
  } catch (error) {
    console.warn('Failed to read category tests from public collection:', error)
  }

  return Array.from(testMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
}

export async function getUserCustomTestById(uid, testId) {
  // Check user subcollection first, then public collection.
  try {
    const userDocRef = doc(db, 'users', uid, 'customTests', testId)
    const userSnapshot = await getDoc(userDocRef)
    if (userSnapshot.exists()) {
      return { id: userSnapshot.id, ...userSnapshot.data() }
    }
  } catch (error) {
    console.warn('Failed to read from user subcollection:', error)
  }

  try {
    const publicRef = doc(db, 'tests', testId)
    const publicSnapshot = await getDoc(publicRef)
    if (publicSnapshot.exists()) {
      return { id: publicSnapshot.id, ...publicSnapshot.data() }
    }
  } catch (error) {
    console.warn('Failed to read from public tests collection:', error)
  }

  return null
}

export async function deleteUserCustomTest(uid, testId) {
  const userRef = doc(db, 'users', uid, 'customTests', testId)
  await deleteDoc(userRef)

  // Best-effort delete from public collection.
  try {
    const publicRef = doc(db, 'tests', testId)
    await deleteDoc(publicRef)
  } catch (error) {
    console.warn('Public test delete skipped:', error.code || error.message)
  }
}

export async function saveUserCompletedTest(uid, testKey, result) {
  const ref = doc(db, 'users', uid, 'completedTests', testKey)
  await setDoc(ref, result)
}

export async function getUserCompletedTests(uid) {
  const snapshot = await getDocs(getCompletedTestsCollection(uid))
  const results = {}

  snapshot.docs.forEach((entry) => {
    results[entry.id] = entry.data()
  })

  return results
}

export async function deleteUserCompletedTest(uid, testKey) {
  const ref = doc(db, 'users', uid, 'completedTests', testKey)
  await deleteDoc(ref)
}
