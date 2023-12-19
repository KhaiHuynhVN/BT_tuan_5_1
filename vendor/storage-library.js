function STORAGE(key) {
   let store = JSON.parse(localStorage.getItem(key)) || {};
   function save() {
      localStorage.setItem(key, JSON.stringify(store));
   }
   let storage = {
      get(key) {
         return store[key];
      },
      set(key, value) {
         store[key] = value;
         save();
      },
      remove(key) {
         delete store[key];
         save();
      },
   };
   return storage;
}
// export default STORAGE;
