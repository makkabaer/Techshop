$(function () {
  // 1. GANZ WICHTIG: Versteckt sofort alle Sektionen beim Neuladen, damit nichts flackert!
  $(".content-section").hide();
  const productsById = {};

  function escapeHtml(value) {
    return $("<div>").text(value == null ? "" : String(value)).html();
  }

  function validateForm(formSelector) {
    const form = $(formSelector)[0];

    if (!form || form.checkValidity()) {
      return true;
    }

    form.reportValidity();
    return false;
  }

  function showSection(sectionId) {
    $(".content-section").hide();
    $(sectionId).fadeIn(150);
    hideMessage();
  }

  function setActiveNav(sectionName) {
    $(".nav-link").removeClass("active");
    $("[data-section='" + sectionName + "']").addClass("active");
  }

  function setActiveAdminQuickAction(sectionName) {
    const $quickLinks = $("#adminDashboardSection .admin-quick-link");
    $quickLinks.removeClass("active");

    if (sectionName === "admin-products" || sectionName === "admin-customers") {
      $quickLinks.filter("[data-section='" + sectionName + "']").addClass("active");
    }
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

  function getProductImagePath(product) {
    if (
      typeof product.image_path === "string" &&
      (/^(https?:\/\/|backend\/)/).test(product.image_path)
    ) {
      return product.image_path;
    }

    return "https://placehold.co/600x400/e9ecef/6c757d?text=No+Image";
  }

  function formatPrice(priceValue) {
    const numericPrice = Number(priceValue);

    if (Number.isNaN(numericPrice)) {
      return "-";
    }

    return "EUR " + numericPrice.toFixed(2);
  }

  function formatRating(ratingValue) {
    const numericRating = Number(ratingValue);

    if (Number.isNaN(numericRating)) {
      return "0.0";
    }

    return numericRating.toFixed(1);
  }

  function requestWithBackendFallback(options) {
    const originalUrl = options.url;
    const deferred = $.Deferred();

    $.ajax(options)
      .done(function () {
        deferred.resolve.apply(deferred, arguments);
      })
      .fail(function (xhr) {
        if (!(xhr && xhr.status === 404)) {
          deferred.reject.apply(deferred, arguments);
          return;
        }

        if (typeof originalUrl !== "string" || originalUrl.indexOf("backend/") === 0) {
          deferred.reject.apply(deferred, arguments);
          return;
        }

        $.ajax($.extend({}, options, {
          url: "backend/" + originalUrl
        }))
          .done(function () {
            deferred.resolve.apply(deferred, arguments);
          })
          .fail(function () {
            deferred.reject.apply(deferred, arguments);
          });
      });

    return deferred.promise();
  }

  function setCartSummary(cartData) {
    const safeData = cartData || {};
    const totalItems = Number(safeData.total_items) || 0;
    const totalPrice = Number(safeData.total_price) || 0;

    $("#cartTotalItems").text(totalItems);
    $("#navCartCount").text(totalItems);
    $("#cartTotalPrice").text(formatPrice(totalPrice));
    $("#checkoutTotalPrice").text(formatPrice(totalPrice));
  }

  function renderCart(cartData) {
    const $container = $("#cartItemsContainer");

    if (!$container.length) {
      return;
    }

    const items = cartData && Array.isArray(cartData.items) ? cartData.items : [];
    setCartSummary(cartData);

    if (!items.length) {
      $container.html('<div class="alert alert-light border mb-0">Dein Warenkorb ist leer.</div>');
      return;
    }

    let html = '<div class="table-responsive"><table class="table align-middle mb-0">';
    html += '<thead><tr><th>Produkt</th><th class="text-end">Preis</th><th class="text-center">Menge</th><th class="text-end">Summe</th><th class="text-end">Aktion</th></tr></thead><tbody>';

    $.each(items, function (_, item) {
      const productId = Number(item.product_id) || 0;
      const quantity = Number(item.quantity) || 1;

      html += "<tr>";
      html += "<td class='fw-semibold'>" + escapeHtml(item.name || "Unbekanntes Produkt") + "</td>";
      html += "<td class='text-end'>" + formatPrice(item.price) + "</td>";
      html += "<td class='text-center'>";
      html += "  <div class='cart-qty-group d-inline-flex align-items-center gap-2'>";
      html += "    <input type='number' min='1' class='form-control form-control-sm js-cart-quantity' value='" + quantity + "' data-product-id='" + productId + "' style='width: 78px;'>";
      html += "    <button type='button' class='btn btn-sm btn-outline-primary js-cart-update' data-product-id='" + productId + "'>Aendern</button>";
      html += "  </div>";
      html += "</td>";
      html += "<td class='text-end fw-semibold'>" + formatPrice(item.item_total) + "</td>";
      html += "<td class='text-end'><button type='button' class='btn btn-sm btn-outline-danger js-cart-remove' data-product-id='" + productId + "'>Loeschen</button></td>";
      html += "</tr>";
    });

    html += "</tbody></table></div>";
    $container.html(html);
  }

  function fetchCart() {
    return requestWithBackendFallback({
      url: "backend/api/cart.php",
      method: "GET",
      dataType: "json"
    });
  }

  function loadCart() {
    const $container = $("#cartItemsContainer");

    if (!$container.length) {
      return;
    }

    $container.html('<p class="text-muted mb-0">Warenkorb wird geladen...</p>');

    fetchCart()
      .done(function (response) {
        const cartData = response && response.data ? response.data : { items: [], total_items: 0, total_price: 0 };
        renderCart(cartData);
      })
      .fail(function (xhr) {
        setCartSummary({ total_items: 0, total_price: 0 });
        $container.html('<div class="alert alert-danger mb-0">Warenkorb konnte nicht geladen werden.</div>');
        showMessage("error", getErrorMessage(xhr, "Warenkorb konnte nicht geladen werden."));
      });
  }

  function updateCartItem(productId, quantity) {
    return requestWithBackendFallback({
      url: "backend/api/cart.php",
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
  }

  function removeCartItem(productId) {
    return requestWithBackendFallback({
      url: "backend/api/cart.php?product_id=" + encodeURIComponent(productId),
      method: "DELETE",
      dataType: "json"
    });
  }

  function renderProducts(products) {
    const $container = $("#productsContainer");

    if (!$container.length) {
      return;
    }

    if (!Array.isArray(products) || !products.length) {
      $container.html('<div class="col-12"><p class="text-muted text-center">Aktuell sind keine Produkte verfuegbar.</p></div>');
      return;
    }

    let productCards = "";
    Object.keys(productsById).forEach(function (productId) {
      delete productsById[productId];
    });

    $.each(products, function (_, product) {
      const productId = Number(product.id) || 0;
      productsById[productId] = product;
      productCards += '<div class="col-sm-6 col-xl-4 mb-4">';
      productCards += '  <article class="card border-0 shadow-sm h-100">';
      productCards += '    <img src="' + escapeHtml(getProductImagePath(product)) + '" class="card-img-top" alt="' + escapeHtml(product.name || "Produkt") + '" loading="lazy" style="height: 190px; object-fit: cover;">';
      productCards += '    <div class="card-body d-flex flex-column">';
      productCards += '      <h3 class="h6 mb-2">' + escapeHtml(product.name || "Unbenanntes Produkt") + '</h3>';
      productCards += '      <p class="text-secondary small mb-3">' + escapeHtml(product.description || "Keine Beschreibung verfuegbar.") + '</p>';
      productCards += '      <div class="mt-auto d-flex justify-content-between align-items-center">';
      productCards += '        <span class="fw-semibold">' + formatPrice(product.price) + '</span>';
      productCards += '        <span class="badge text-bg-light border">★ ' + formatRating(product.rating) + '</span>';
      productCards += "      </div>";
      productCards += '      <div class="d-flex gap-2 mt-3">';
      productCards += '        <button type="button" class="btn btn-sm btn-outline-secondary flex-grow-1 js-product-details" data-product-id="' + productId + '">Details</button>';
      productCards += '        <button type="button" class="btn btn-sm btn-outline-dark flex-grow-1 js-add-to-cart" data-product-id="' + productId + '">In den Warenkorb</button>';
      productCards += "      </div>";
      productCards += "    </div>";
      productCards += "  </article>";
      productCards += "</div>";
    });

    $container.html(productCards);
  }

  function loadProductsFrom(apiUrl) {
    return $.ajax({
      url: apiUrl,
      method: "GET",
      dataType: "json"
    });
  }

  function loadProductCatalog() {
    const $container = $("#productsContainer");

    if (!$container.length) {
      return;
    }

    $container.html('<div class="col-12"><p class="text-muted text-center">Produkte werden geladen...</p></div>');

    const onSuccess = function (response) {
      const products = response && Array.isArray(response.data) ? response.data : [];
      renderProducts(products);
    };

    const onError = function () {
      $container.html('<div class="col-12"><p class="text-danger text-center">Produkte konnten nicht geladen werden.</p></div>');
    };

    loadProductsFrom("backend/api/products.php")
      .done(onSuccess)
      .fail(onError);
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
          const customerId = Number(customer.id || customer.user_id) || 0;
          const isActive = Number(customer.is_active ?? customer.status ?? 1);
          const createdAt = customer.created_at || customer.createdAt || "-";
          const buttonClass = isActive === 1 ? "btn-outline-danger" : "btn-outline-success";
          const nextStatus = isActive === 1 ? 0 : 1;

          rows += "<tr>";
          rows += "<td>" + escapeHtml(customerId) + "</td>";
          rows += "<td class='fw-semibold'>" + escapeHtml(customer.username || "-") + "</td>";
          rows += "<td>" + escapeHtml(customer.email || "-") + "</td>";
          rows += "<td>" + getCustomerStatusLabel(isActive) + "</td>";
          rows += "<td>" + escapeHtml(createdAt) + "</td>";
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

  function renderOrders(orderData) {
    const $container = $("#ordersContainer");
    const orders = orderData && Array.isArray(orderData.orders) ? orderData.orders : [];

    if (!orders.length) {
      $container.html('<div class="alert alert-light border mb-0">Du hast noch keine Bestellungen.</div>');
      return;
    }

    let html = '<div class="accordion" id="ordersAccordion">';

    $.each(orders, function (_, order) {
      const orderId = Number(order.id) || 0;
      const items = Array.isArray(order.items) ? order.items : [];

      html += '<div class="accordion-item">';
      html += '  <h3 class="accordion-header">';
      html += '    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#order-' + orderId + '" aria-expanded="false" aria-controls="order-' + orderId + '">';
      html += '      Bestellung #' + orderId + ' vom ' + escapeHtml(order.order_date || "-") + ' - ' + formatPrice(order.total_price);
      html += "    </button>";
      html += "  </h3>";
      html += '  <div id="order-' + orderId + '" class="accordion-collapse collapse" data-bs-parent="#ordersAccordion">';
      html += '    <div class="accordion-body">';
      html += '      <p class="mb-3"><span class="badge text-bg-light border">' + escapeHtml(order.status || "pending") + "</span></p>";
      html += '      <div class="table-responsive"><table class="table table-sm align-middle mb-0">';
      html += "        <thead><tr><th>Produkt</th><th class='text-center'>Menge</th><th class='text-end'>Preis</th></tr></thead><tbody>";

      $.each(items, function (_, item) {
        html += "<tr>";
        html += "<td>" + escapeHtml(item.name || "Unbekanntes Produkt") + "</td>";
        html += "<td class='text-center'>" + (Number(item.quantity) || 0) + "</td>";
        html += "<td class='text-end'>" + formatPrice(item.price) + "</td>";
        html += "</tr>";
      });

      html += "      </tbody></table></div>";
      html += "    </div>";
      html += "  </div>";
      html += "</div>";
    });

    html += "</div>";
    $container.html(html);
  }

  function loadOrders() {
    const $container = $("#ordersContainer");
    $container.html('<p class="text-muted mb-0">Bestellungen werden geladen...</p>');

    $.ajax({
      url: "backend/api/orders.php",
      method: "GET",
      dataType: "json"
    })
      .done(function (response) {
        renderOrders(response && response.data ? response.data : { orders: [] });
      })
      .fail(function (xhr) {
        $container.html('<div class="alert alert-danger mb-0">Bestellungen konnten nicht geladen werden.</div>');
        showMessage("error", getErrorMessage(xhr, "Bestellungen konnten nicht geladen werden."));
      });
  }

  function submitOrder(address) {
    return $.ajax({
      url: "backend/api/orders.php",
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        delivery_address: address
      })
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

  // Navigation and quick-action click handler
  $(document).on("click", "[data-section]", function (event) {
    event.preventDefault();
    const section = $(this).data("section");

    setActiveNav(section);
    setActiveAdminQuickAction(section);

    // Falls auf "My Account" geklickt wird, zeige das Dashboard
    if (section === "account") {
      showSection("#dashboardSection");
    } else if (section === "products") {
      showSection("#dashboardSection");
      loadProductCatalog();
    } else if (section === "cart") {
      showSection("#cartSection");
      loadCart();
    } else if (section === "checkout") {
      showSection("#checkoutSection");
      setActiveNav("cart");
      loadCart();
    } else if (section === "orders") {
      showSection("#ordersSection");
      loadOrders();
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

    if (!validateForm("#loginForm")) {
      return;
    }

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

    if (!validateForm("#registerForm")) {
      return;
    }

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
    loadProductCatalog();
    loadCart();

    // Reset navigation
    setActiveNav("account");

    hideMessage();
  }

  function showAdminDashboard(username) {
    $(".content-section").hide();
    $("#adminDashboardSection").fadeIn(150);
    $("#adminName").text(username);
    setActiveNav("home");
    setActiveAdminQuickAction("");
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
          setCartSummary({ total_items: 0, total_price: 0 });
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
        setCartSummary({ total_items: 0, total_price: 0 });
        showMessage("success", "Du wurdest ausgeloggt.");
      }
    });
  });

  $(document).on('click', '#refreshCustomersBtn', function () {
    loadAdminCustomers();
  });

  $(document).on("click", "#refreshCartBtn", function () {
    loadCart();
  });

  $(document).on("click", "#ordersBtn, #refreshOrdersBtn", function () {
    setActiveNav("orders");
    showSection("#ordersSection");
    loadOrders();
  });

  $(document).on("click", ".js-product-details", function () {
    const product = productsById[Number($(this).data("product-id"))];

    if (!product) {
      showMessage("error", "Produktdetails konnten nicht geladen werden.");
      return;
    }

    $("#productDetailsTitle").text(product.name || "Produktdetails");
    $("#productDetailsImage")
      .attr("src", getProductImagePath(product))
      .attr("alt", product.name || "Produkt");
    $("#productDetailsDescription").text(product.description || "Keine Beschreibung verfügbar.");
    $("#productDetailsPrice").text(formatPrice(product.price));
    $("#productDetailsRating").text("★ " + formatRating(product.rating));
    bootstrap.Modal.getOrCreateInstance($("#productDetailsModal")[0]).show();
  });

  $(document).on("click", ".js-add-to-cart", function () {
    const productId = Number($(this).data("product-id"));

    if (!productId) {
      showMessage("error", "Produkt konnte nicht in den Warenkorb gelegt werden.");
      return;
    }

    updateCartItem(productId, 1)
      .done(function (response) {
        if (response && response.data) {
          setCartSummary(response.data);
        }
        showMessage("success", "Produkt zum Warenkorb hinzugefuegt.");
      })
      .fail(function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Produkt konnte nicht hinzugefuegt werden."));
      });
  });

  $(document).on("click", ".js-cart-update", function () {
    const productId = Number($(this).data("product-id"));
    const quantity = Number($(".js-cart-quantity[data-product-id='" + productId + "']").val());

    if (!productId || !quantity || quantity < 1) {
      showMessage("error", "Bitte eine gueltige Menge >= 1 eingeben.");
      return;
    }

    updateCartItem(productId, quantity)
      .done(function (response) {
        const cartData = response && response.data ? response.data : null;
        if (cartData) {
          renderCart(cartData);
        } else {
          loadCart();
        }
        showMessage("success", "Menge aktualisiert.");
      })
      .fail(function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Menge konnte nicht aktualisiert werden."));
      });
  });

  $(document).on("click", ".js-cart-remove", function () {
    const productId = Number($(this).data("product-id"));

    if (!productId) {
      showMessage("error", "Ungueltiges Produkt.");
      return;
    }

    removeCartItem(productId)
      .done(function (response) {
        const cartData = response && response.data ? response.data : null;
        if (cartData) {
          renderCart(cartData);
        } else {
          loadCart();
        }
        showMessage("success", "Produkt aus dem Warenkorb entfernt.");
      })
      .fail(function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Produkt konnte nicht entfernt werden."));
      });
  });

  $(document).on("submit", "#checkoutForm", function (event) {
    event.preventDefault();
    hideMessage();

    const address = $.trim($("#checkoutAddress").val());

    if (!address) {
      showMessage("error", "Bitte eine Lieferadresse eingeben.");
      return;
    }

    if (!validateForm("#checkoutForm")) {
      return;
    }

    submitOrder(address)
      .done(function (response) {
        $("#checkoutForm").trigger("reset");
        setCartSummary({ total_items: 0, total_price: 0 });
        showSection("#ordersSection");
        setActiveNav("orders");
        loadOrders();
        showMessage("success", getResponseMessage(response));
      })
      .fail(function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Bestellung konnte nicht abgeschlossen werden."));
      });
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
    if (!validateForm("#addProductForm")) return;
    submitProductForm("#addProductForm", "backend/api/add_product.php", "Produkt erfolgreich angelegt.");
  });

  $(document).on("submit", "#editProductForm", function (event) {
    event.preventDefault();
    hideMessage();
    if (!validateForm("#editProductForm")) return;
    submitProductForm("#editProductForm", "backend/api/edit_product.php", "Produkt erfolgreich aktualisiert.");
  });

  $(document).on("submit", "#deleteProductForm", function (event) {
    event.preventDefault();
    hideMessage();

    if (!validateForm("#deleteProductForm")) return;

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
