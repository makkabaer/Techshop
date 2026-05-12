$(function () {
  // 1. GANZ WICHTIG: Versteckt sofort alle Sektionen beim Neuladen, damit nichts flackert!
  $(".content-section").hide();

  function showSection(sectionId) {
    $(".content-section").hide();
    $(sectionId).fadeIn(150);
    hideMessage();
  }

  function setActiveNav(sectionName) {
    $(".nav-link").removeClass("active");
    $("[data-section='" + sectionName + "']").addClass("active");
  }

  function getCustomerStatusLabel(isActive) {
    if (Number(isActive) === 1) {
      return '<span class="badge bg-success">Aktiv</span>';
    }

    return '<span class="badge bg-secondary">Deaktiviert</span>';
  }

  function getCustomerActionLabel(isActive) {
    if (Number(isActive) === 1) {
      return "Deactivate";
    }

    return "Activate";
  }

  function loadAdminCustomers() {
    const $tbody = $("#adminCustomersTableBody");
    const $empty = $("#adminCustomersEmpty");

    $empty.addClass("d-none");
    $tbody.html('<tr><td colspan="6" class="text-center text-secondary py-4">Kunden werden geladen...</td></tr>');

    $.ajax({
      url: "backend/api/admin_users.php",
      method: "GET",
      dataType: "json",
      success: function (response) {
        let customers = [];

        if (Array.isArray(response.customers)) {
          customers = response.customers;
        } else if (Array.isArray(response.users)) {
          customers = response.users;
        }

        if (!customers.length) {
          $tbody.empty();
          $empty.removeClass("d-none");
          return;
        }

        let rows = "";

        $.each(customers, function (_, customer) {
          const customerId = customer.id || customer.user_id;
          const isActive = Number(customer.is_active ?? customer.status ?? 1);
          const createdAt = customer.created_at || customer.createdAt || "-";
          const buttonClass = isActive === 1 ? "btn-outline-danger" : "btn-outline-success";
          const nextStatus = isActive === 1 ? 0 : 1;

          rows += "<tr>";
          rows += "<td>" + customerId + "</td>";
          rows += "<td class='fw-semibold'>" + (customer.username || "-") + "</td>";
          rows += "<td>" + (customer.email || "-") + "</td>";
          rows += "<td>" + getCustomerStatusLabel(isActive) + "</td>";
          rows += "<td>" + createdAt + "</td>";
          rows += "<td class='text-end'>";
          rows += "<button type='button' class='btn btn-sm " + buttonClass + " js-toggle-customer-status' data-user-id='" + customerId + "' data-status='" + nextStatus + "'>";
          rows += getCustomerActionLabel(isActive);
          rows += "</button>";
          rows += "</td>";
          rows += "</tr>";
        });

        $tbody.html(rows);
      },
      error: function (xhr) {
        $tbody.html('<tr><td colspan="6" class="text-center text-danger py-4">Kunden konnten nicht geladen werden.</td></tr>');
        showMessage("error", getErrorMessage(xhr, "Kunden konnten nicht geladen werden."));
      }
    });
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
    return "Vorgang abgeschlossen.";
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

    setActiveNav(section);

    // Falls auf "My Account" geklickt wird, zeige das Dashboard
    if (section === "account") {
      showSection("#dashboardSection");
    } else if (section === "admin-customers") {
      showSection("#adminCustomersSection");
      loadAdminCustomers();
    } else if (section === "admin-products") {
      showSection("#adminProductsSection");
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
        showMessage("error", getErrorMessage(xhr, "Login fehlgeschlagen."));
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
            showMessage("success", "Registrierung erfolgreich! Bitte einloggen.");
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
    setActiveNav("account");

    hideMessage();
  }

  function showAdminDashboard(username) {
    $(".content-section").hide();
    $("#adminDashboardSection").fadeIn(150);
    $("#adminName").text(username);
    setActiveNav("home");
    hideMessage();
  }

  function submitProductForm(formSelector, url, successText) {
    const formElement = $(formSelector)[0];
    const formData = new FormData(formElement);

    $.ajax({
      url: url,
      method: "POST",
      dataType: "json",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");

        showMessage(isSuccess ? "success" : "error", getResponseMessage(response));

        if (isSuccess) {
          $(formSelector).trigger("reset");

          if (successText) {
            showMessage("success", successText);
          }
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Product request failed."));
      }
    });
  }

  // Menü basierend auf dem Login-Status bauen
  function checkAuthStatus() {
    $.ajax({
      url: "backend/api/check_auth.php",
      method: "GET",
      dataType: "json",
      success: function (response) {
        if (response.logged_in) {
          $(".guest-only").hide();
          $(".auth-only").show();

          if (response.role === "admin") {
            $(".admin-only").show();
            $(".customer-only").hide();
            $(".not-admin").hide();

            showAdminDashboard(response.username);
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
      error: function () {
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
        showMessage("success", "Du wurdest ausgeloggt.");
      }
    });
  });

  $(document).on('click', '#refreshCustomersBtn', function () {
    loadAdminCustomers();
  });

  $(document).on("click", ".js-toggle-customer-status", function () {
    const userId = $(this).data("user-id");
    const status = $(this).data("status");

    if (!userId) {
      showMessage("error", "Ungültige Kundenauswahl.");
      return;
    }

    const isDeactivating = Number(status) === 0;
    const confirmed = window.confirm(
      isDeactivating
        ? "Dieses Kundenkonto deaktivieren?"
        : "Dieses Kundenkonto aktivieren?"
    );

    if (!confirmed) {
      return;
    }

    $.ajax({
      url: "backend/api/admin_users.php",
      method: "POST",
      dataType: "json",
      data: {
        user_id: userId,
        status: status
      },
      success: function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");

        showMessage(isSuccess ? "success" : "error", getResponseMessage(response));

        if (isSuccess) {
          loadAdminCustomers();
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Kundenstatus konnte nicht geändert werden."));
      }
    });
  });

  $(document).on("submit", "#addProductForm", function (event) {
    event.preventDefault();
    hideMessage();
    submitProductForm("#addProductForm", "backend/api/add_product.php", "Produkt erfolgreich angelegt.");
  });

  $(document).on("submit", "#editProductForm", function (event) {
    event.preventDefault();
    hideMessage();
    submitProductForm("#editProductForm", "backend/api/edit_product.php", "Produkt erfolgreich aktualisiert.");
  });

  $(document).on("submit", "#deleteProductForm", function (event) {
    event.preventDefault();
    hideMessage();

    const productId = $.trim($("#deleteProductId").val());

    if (!productId) {
      showMessage("error", "Bitte eine Produkt-ID eingeben.");
      return;
    }

    if (!window.confirm("Dieses Produkt löschen?")) {
      return;
    }

    $.ajax({
      url: "backend/api/delete_product.php",
      method: "POST",
      dataType: "json",
      data: {
        product_id: productId
      },
      success: function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");

        showMessage(isSuccess ? "success" : "error", getResponseMessage(response));

        if (isSuccess) {
          $("#deleteProductForm").trigger("reset");
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Löschen fehlgeschlagen."));
      }
    });
  });

  // 2. GANZ WICHTIG: Status prüfen (das startet den Flow!)
  checkAuthStatus();
});