$(function () {
  // 1. GANZ WICHTIG: Versteckt sofort alle Sektionen beim Neuladen, damit nichts flackert!
  $(".content-section").hide();

  function showSection(sectionId) {
    $(".content-section").hide();
    $(sectionId).fadeIn(150);
    hideMessage();
  }

  function showMessage(type, text) {
    $("#messageArea")
      .removeClass("d-none alert-success alert-danger")
      .addClass(type === "success" ? "alert-success" : "alert-danger")
      .text(text)
      .show();
  }

  function hideMessage() {
    $("#messageArea").addClass("d-none").text("");
  }

  function getResponseMessage(response) {
    if (response && response.message) return response.message;
    if (response && response.error) return response.error;
    return "Request completed.";
  }

  function getErrorMessage(xhr, fallbackMessage) {
    if (xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) {
      return xhr.responseJSON.message || xhr.responseJSON.error;
    }
    try {
      const data = JSON.parse(xhr.responseText);
      return data.message || data.error || fallbackMessage;
    } catch (e) {
      return fallbackMessage;
    }
  }

  // Navigation Click Handler
  $(".nav-link").on("click", function (event) {
    event.preventDefault();
    const section = $(this).data("section");

    $(".nav-link").removeClass("active");
    $(this).addClass("active");

    // Falls auf "My Account" geklickt wird, zeige das Dashboard
    if (section === "account") {
        showSection("#dashboardSection");
    } else {
        showSection("#" + section + "Section");
    }
  });

  // Login Form Submit
  $("#loginForm").on("submit", function (event) {
    event.preventDefault();
    hideMessage();

    const data = {
      email: $.trim($("#loginEmail").val()),
      password: $("#loginPassword").val(),
      remember: $("#loginRemember").is(":checked") ? "true" : "false"
    };

    $.ajax({
      url: "backend/api/login.php",
      method: "POST",
      dataType: "json",
      data: data,
      success: function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");
        showMessage(isSuccess ? "success" : "error", getResponseMessage(response));

        if (isSuccess) {
          $("#loginForm").trigger("reset");
          setTimeout(function () {
            checkAuthStatus(); // Lädt das UI neu
          }, 1000);
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Login request failed."));
      }
    });
  });

  // Register Form Submit
  $("#registerForm").on("submit", function (event) {
    event.preventDefault();
    hideMessage();

    const form = $(this);
    const data = {
      username: $.trim($("#registerUsername").val()),
      email: $.trim($("#registerEmail").val()),
      password: $("#registerPassword").val()
    };

    $.ajax({
      url: "backend/api/register.php",
      method: "POST",
      dataType: "json",
      data: data,
      success: function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");
        showMessage(isSuccess ? "success" : "error", getResponseMessage(response));

        if (isSuccess) {
          form.trigger("reset");
          setTimeout(function () {
            showSection("#loginSection"); // Springt zum Login!
            showMessage("success", "Registration successful! Please log in.");
            $(".nav-link").removeClass("active");
            $("[data-section='login']").addClass("active");
          }, 1500);
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Registration request failed."));
      }
    });
  });

  // Wiederhergestellte Dashboard-Funktion
  function showDashboard(username) {
    $(".content-section").hide();
    $("#dashboardSection").fadeIn(150);
    $("#dashboardUsername").text(username);
    $("#accountUsername").text(username);
    
    // Reset navigation
    $(".nav-link").removeClass("active");
    $("[data-section='account']").addClass("active");
    
    hideMessage();
  }

  // Menü basierend auf dem Login-Status bauen
  function checkAuthStatus() {
    $.ajax({
      url: "backend/api/check_auth.php",
      method: "GET",
      dataType: "json",
      success: function(response) {
        if (response.logged_in) {
          $(".guest-only").hide();
          $(".auth-only").show();
          
          if (response.role === 'admin') {
          $(".admin-only").show();
          $(".customer-only").hide();
          $(".not-admin").hide();
          
          // Zeige das neue Admin-Dashboard
          $("#adminName").text(response.username);
          showSection("#adminDashboardSection"); 
          
          $(".nav-link").removeClass("active");
          // Falls du einen Nav-Link fürs Admin-Dashboard hast, hier markieren
        } else {
            $(".admin-only").hide();
            $(".customer-only").show();
            $(".not-admin").show();
            showDashboard(response.username);
          }
        } else {
          // Nicht eingeloggt
          $(".guest-only").show();
          $(".auth-only").hide();
          $(".admin-only").hide();
          $(".customer-only").hide();
          $(".not-admin").show();
          showSection("#homeSection");
          $(".nav-link").removeClass("active");
          $("[data-section='home']").addClass("active");
        }
      },
      error: function() {
        // Fallback, falls der Server mal nicht antwortet
        showSection("#homeSection");
      }
    });
  }

  // Logout Handler
  $(document).on("click", "#logoutBtn, #navLogoutBtn", function (event) {
    event.preventDefault();
    hideMessage();

    $.ajax({
      url: "backend/api/logout.php",
      method: "POST",
      dataType: "json",
      success: function () {
        checkAuthStatus(); // Menü und View zurücksetzen
        showMessage("success", "You have been logged out.");
      }
    });
  });

  // 2. GANZ WICHTIG: Status prüfen (das startet den Flow!)
  checkAuthStatus();
});