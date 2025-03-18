module.exports = {
  // Deployment settings
  deploy: {
    // Build settings
    build: {
      command: 'ng build --configuration production',
      outputDir: 'dist/todo-app'
    },
    // Server settings
    server: {
      port: process.env.PORT || 3000,
      host: '0.0.0.0'
    },
    // Static file serving
    static: {
      directory: 'dist/todo-app',
      options: {
        index: 'index.html'
      }
    }
  }
}; 