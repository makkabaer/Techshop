$(function () {
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
    if (response && response.message) {
      return response.message;
    }
    if (response && response.error) {
      return response.error;
    }
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

  $(".nav-link").on("click", function (event) {
    event.preventDefault();
    const section = $(this).data("section");

    $(".nav-link").removeClass("active");
    $(this).addClass("active");

    showSection("#" + section + "Section");
  });

  $("#loginForm").on("submit", function (event) {
    event.preventDefault();
    hideMessage();

    const form = $(this);
    const data = {
      email: $.trim($("#loginEmail").val()),
      password: $("#loginPassword").val()
    };

    $.ajax({
      url: "/api/login.php",
      method: "POST",
      dataType: "json",
      data: data,
      success: function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");
        const message = getResponseMessage(response);
        showMessage(isSuccess ? "success" : "error", message);

        if (isSuccess) {
          form.trigger("reset");
          // Auto-navigate to dashboard after 1.5 seconds
          const username = response.username || "User";
          setTimeout(function () {
            showDashboard(username);
          }, 1500);
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Login request failed."));
      }
    });
  });

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
      url: "/api/register.php",
      method: "POST",
      dataType: "json",
      data: data,
      success: function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");
        const message = getResponseMessage(response);
        showMessage(isSuccess ? "success" : "error", message);

        if (isSuccess) {
          form.trigger("reset");
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Registration request failed."));
      }
    });
  });

  // Dashboard function
  function showDashboard(username) {
    $(".content-section").hide();
    $("#dashboardSection").show();
    $("#dashboardUsername").text(username);
    $("#accountUsername").text(username);
    $("#dashboardNavItem").show();
    
    // Reset navigation
    $(".nav-link").removeClass("active");
    $("[data-section='dashboard']").addClass("active");
    
    // Hide login/register in nav
    $("[data-section='login']").parent().hide();
    $("[data-section='register']").parent().hide();
    
    hideMessage();
  }

  // Logout handler
  $(document).on("click", "#logoutBtn", function (event) {
    event.preventDefault();
    hideMessage();

    $.ajax({
      url: "/api/logout.php",
      method: "POST",
      dataType: "json",
      success: function (response) {
        showMessage("success", "You have been logged out.");
        setTimeout(function () {
          location.reload(); // Reload page to reset state
        }, 1500);
      },
      error: function (xhr) {
        // Even if error, logout locally
        location.reload();
      }
    });
  });

  showSection("#homeSection");
});
