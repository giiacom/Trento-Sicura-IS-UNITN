// Controlla il livello di sicurezza della password
function checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars) {
      return 'Forte';
    } else if (password.length >= minLength && (hasUpperCase || hasLowerCase) && hasNumbers) {
      return 'Media';
    } else {
      return 'Debole';
    }
  }
  
  // Mostra il livello di sicurezza della password
  function displayPasswordStrength(strength) {
    const strengthElement = document.getElementById('passwordStrength');
    strengthElement.textContent = `Sicurezza: ${strength}`;
  
    if (strength === 'Forte') {
      strengthElement.style.color = 'green';
    } else if (strength === 'Media') {
      strengthElement.style.color = 'orange';
    } else {
      strengthElement.style.color = 'red';
    }
  }
  
  // Genera una password sicura
  function generatePassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
  
  // Suggerisce una password se la sicurezza è insufficiente
  function suggestPassword() {
    const suggestedPasswordElement = document.getElementById('suggestedPassword');
    suggestedPasswordElement.textContent = `Password suggerita: ${generatePassword()}`;
    suggestedPasswordElement.style.display = 'block';
  }
  
  // Gestisce l'input della password
  document.getElementById('password').addEventListener('input', function () {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    displayPasswordStrength(strength);
  
    if (strength === 'Debole') {
      suggestPassword();
    } else {
      document.getElementById('suggestedPassword').style.display = 'none';
    }
  });
  
  // Controlla in tempo reale se le password coincidono
  document.getElementById('confirmPassword').addEventListener('input', function () {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
  
    // Esegui il controllo solo se entrambe le password hanno una lunghezza minima
    if (password.length >= 8 && confirmPassword.length >= 8) {
      if (password !== confirmPassword) {
        this.setCustomValidity('Le password non coincidono.');
        this.style.borderColor = 'red'; // Aggiungi un bordo rosso per indicare l'errore
        document.getElementById('passwordStrength').textContent = 'Le password non coincidono!';
        document.getElementById('passwordStrength').style.color = 'red';
      } else {
        this.setCustomValidity(''); // Rimuovi il messaggio di errore
        this.style.borderColor = '#d1d5db'; // Ripristina il colore del bordo
        checkPasswordStrength(password); // Ri-valuta la sicurezza della password
      }
    } else {
      this.setCustomValidity(''); // Rimuovi il messaggio di errore se le password non sono ancora state inserite completamente
      this.style.borderColor = '#d1d5db'; // Ripristina il colore del bordo
    }
  });
  
  // Gestisce il click sulla password suggerita
  document.getElementById('suggestedPassword').addEventListener('click', function () {
    const suggestedPassword = generatePassword();
    document.getElementById('password').value = suggestedPassword;
    document.getElementById('confirmPassword').value = suggestedPassword;
    document.getElementById('passwordStrength').textContent = 'Sicurezza: Forte';
    document.getElementById('passwordStrength').style.color = 'green';
    this.style.display = 'none';
  });
  
  // Gestisce la registrazione dell'utente (solo front-end)
  function registerUser(event) {
    event.preventDefault();
  
    const inputs = {
      username: document.getElementById('username').value.trim(),
      password: document.getElementById('password').value.trim(),
      confirm: document.getElementById('confirmPassword').value.trim()
    };
  
    // Validazione avanzata
    const errors = [];
    
    if (!inputs.username) errors.push('Il campo username è obbligatorio');
    if (!inputs.password) errors.push('Il campo password è obbligatorio');
    if (!inputs.confirm) errors.push('Devi confermare la password');
    
    if (inputs.password !== inputs.confirm) {
      errors.push('Le password non coincidono');
    }
  
    const strength = checkPasswordStrength(inputs.password);
    if (strength === 'Debole') {
      errors.push('La password non rispetta i requisiti minimi di sicurezza');
    }
  
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
  
    // Simula una registrazione riuscita e reindirizza alla pagina di login
    alert('Registrazione completata con successo!');
    window.location.href = 'Login.html'; // Reindirizza alla pagina di login
  }