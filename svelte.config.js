import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter(),
    paths: {
      base: '/progetto-carceri'
    }
  }
};

export default config;
