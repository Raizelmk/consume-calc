# Code Citations

## License: unknown
https://github.com/jujarazo/santex-fe-challange/blob/c90cc98902cea1ac000c05345e3e3267b35c8f1c/src/hooks/useStateWithStorage.tsx

```
/ Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error
```


## License: unknown
https://github.com/DanielArzani/markdown-editor/blob/9331891c0da2b376186cea7798fafa454ead1653/src/hooks/useLocalStorage.ts

```
/ Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error
```


## License: unknown
https://github.com/Omar-Seba/Hrflowai-interview/blob/db8d7410fe27fdbf43b29015b8920026dba8fbda/src/utils/LocalStorage.ts

```
/ Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error
```

