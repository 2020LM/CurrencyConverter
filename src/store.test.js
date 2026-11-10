import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRates, loadRatesAsync, makeStore, ratesApi } from './store.js';

const response = { result: 'success', base_code: 'USD', rates: { USD: 1, EUR: 0.9 } };

test('all implementations load rates and report service errors', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  for (const [name, action, slice] of [
    ['Redux Thunk', loadRates, 'thunkRates'],
    ['createAsyncThunk', loadRatesAsync, 'asyncRates'],
  ]) {
    await t.test(name, async () => {
      const store = makeStore();
      globalThis.fetch = async (url) => {
        assert.equal(url, 'https://open.er-api.com/v6/latest/USD');
        return { ok: true, json: async () => response };
      };
      const request = store.dispatch(action('USD'));
      assert.equal(store.getState()[slice].status, 'loading');
      await request;
      assert.equal(store.getState()[slice].status, 'succeeded');
      assert.deepEqual(store.getState()[slice].data, response);

      globalThis.fetch = async () => ({ ok: false, status: 503 });
      await store.dispatch(action('USD'));
      assert.equal(store.getState()[slice].status, 'failed');
      assert.match(store.getState()[slice].error, /503/);
      assert.equal(store.getState()[slice].data, null);
    });
  }

  await t.test('RTK Query caches by base and reports invalid responses', async () => {
    const store = makeStore();
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return { ok: true, json: async () => response };
    };
    const first = store.dispatch(ratesApi.endpoints.getRates.initiate('USD'));
    assert.deepEqual((await first).data, response);
    const second = store.dispatch(ratesApi.endpoints.getRates.initiate('USD'));
    assert.deepEqual((await second).data, response);
    assert.equal(calls, 1);
    first.unsubscribe();
    second.unsubscribe();

    globalThis.fetch = async () => ({ ok: true, json: async () => ({ result: 'error' }) });
    const invalid = store.dispatch(ratesApi.endpoints.getRates.initiate('EUR'));
    assert.match((await invalid).error.error, /invalid data/);
    invalid.unsubscribe();
    store.dispatch(ratesApi.util.resetApiState());
  });
});
