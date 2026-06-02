$(function () {
  // Hide all sections immediately to prevent flickering during reloads.
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

  function isSuccessfulResponse(response) {
    return response && (response.success === true || response.status === "success");
  }

  function setButtonBusy($button, isBusy) {
    if (!$button || !$button.length) {
      return;
    }

    $button.prop("disabled", isBusy).attr("aria-busy", isBusy ? "true" : "false");
  }

  function runWithBusyButton($button, callback) {
    if ($button.prop("disabled")) {
      return;
    }

    setButtonBusy($button, true);
    const request = callback();

    if (request && typeof request.always === "function") {
      request.always(function () {
        setButtonBusy($button, false);
      });
      return;
    }

    setButtonBusy($button, false);
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

    if (
      sectionName === "admin-products" ||
      sectionName === "admin-customers" ||
      sectionName === "admin-orders"
    ) {
      $quickLinks.filter("[data-section='" + sectionName + "']").addClass("active");
    }
  }

  function getCustomerStatusLabel(isActive) {
    if (Number(isActive) === 1) {
      return '<span class="badge bg-success">Active</span>';
    }

    return '<span class="badge bg-secondary">Deactivated</span>';
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
      $container.html('<div class="alert alert-light border mb-0">Your cart is empty.</div>');
      return;
    }

    let html = '<div class="table-responsive"><table class="table align-middle mb-0">';
    html += '<thead><tr><th>Product</th><th class="text-end">Price</th><th class="text-center">Quantity</th><th class="text-end">Total</th><th class="text-end">Action</th></tr></thead><tbody>';

    $.each(items, function (_, item) {
      const productId = Number(item.product_id) || 0;
      const quantity = Number(item.quantity) || 1;

      html += "<tr>";
      html += "<td class='fw-semibold'>" + escapeHtml(item.name || "Unknown Product") + "</td>";
      html += "<td class='text-end'>" + formatPrice(item.price) + "</td>";
      html += "<td class='text-center'>";
      html += "  <div class='cart-qty-group d-inline-flex align-items-center gap-2'>";
      html += "    <input type='number' min='1' class='form-control form-control-sm js-cart-quantity' value='" + quantity + "' data-product-id='" + productId + "' style='width: 78px;'>";
      html += "    <button type='button' class='btn btn-sm btn-outline-primary js-cart-update' data-product-id='" + productId + "'>Update</button>";
      html += "  </div>";
      html += "</td>";
      html += "<td class='text-end fw-semibold'>" + formatPrice(item.item_total) + "</td>";
      html += "<td class='text-end'><button type='button' class='btn btn-sm btn-outline-danger js-cart-remove' data-product-id='" + productId + "'>Remove</button></td>";
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

    $container.html('<p class="text-muted mb-0">Cart is loading...</p>');

    return fetchCart()
      .done(function (response) {
        if (!isSuccessfulResponse(response)) {
          setCartSummary({ total_items: 0, total_price: 0 });
          $container.html('<div class="alert alert-danger mb-0">Cart could not be loaded.</div>');
          showMessage("error", getResponseMessage(response));
          return;
        }

        const cartData = response && response.data ? response.data : { items: [], total_items: 0, total_price: 0 };
        renderCart(cartData);
      })
      .fail(function (xhr) {
        setCartSummary({ total_items: 0, total_price: 0 });
        $container.html('<div class="alert alert-danger mb-0">Cart could not be loaded.</div>');
        showMessage("error", getErrorMessage(xhr, "Cart could not be loaded."));
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
      $container.html('<div class="col-12"><p class="text-muted text-center">No products are currently available.</p></div>');
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
      productCards += '    <img src="' + escapeHtml(getProductImagePath(product)) + '" class="card-img-top" alt="' + escapeHtml(product.name || "Product") + '" loading="lazy" style="height: 190px; object-fit: cover;">';
      productCards += '    <div class="card-body d-flex flex-column">';
      productCards += '      <h3 class="h6 mb-2">' + escapeHtml(product.name || "Unnamed Product") + '</h3>';
      productCards += '      <p class="text-secondary small mb-3">' + escapeHtml(product.description || "No description available.") + '</p>';
      productCards += '      <div class="mt-auto d-flex justify-content-between align-items-center">';
      productCards += '        <span class="fw-semibold">' + formatPrice(product.price) + '</span>';
      productCards += '        <span class="badge text-bg-light border">★ ' + formatRating(product.rating) + '</span>';
      productCards += "      </div>";
      productCards += '      <div class="d-flex gap-2 mt-3">';
      productCards += '        <button type="button" class="btn btn-sm btn-outline-secondary flex-grow-1 js-product-details" data-product-id="' + productId + '">Details</button>';
      productCards += '        <button type="button" class="btn btn-sm btn-outline-dark flex-grow-1 js-add-to-cart" data-product-id="' + productId + '">Add to Cart</button>';
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

    $container.html('<div class="col-12"><p class="text-muted text-center">Products are loading...</p></div>');

    const onSuccess = function (response) {
      if (!isSuccessfulResponse(response)) {
        onError(response);
        return;
      }

      const products = response && Array.isArray(response.data) ? response.data : [];
      renderProducts(products);
    };

    const onError = function (response) {
      $container.html('<div class="col-12"><p class="text-danger text-center">Products could not be loaded.</p></div>');
      if (response && response.success === false) {
        showMessage("error", getResponseMessage(response));
      }
    };

    loadProductsFrom("backend/api/products.php")
      .done(onSuccess)
      .fail(onError);
  }

  function loadAdminCustomers() {
    const $tbody = $("#adminCustomersTableBody");
    const $empty = $("#adminCustomersEmpty");

    $empty.addClass("d-none");
    $tbody.html('<tr><td colspan="6" class="text-center text-secondary py-4">Customers are loading...</td></tr>');

    return $.ajax({
      url: "backend/api/admin_users.php",
      method: "GET",
      dataType: "json",
      success: function (response) {
        if (!isSuccessfulResponse(response)) {
          $tbody.html('<tr><td colspan="6" class="text-center text-danger py-4">Customers could not be loaded.</td></tr>');
          showMessage("error", getResponseMessage(response));
          return;
        }

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
        $tbody.html('<tr><td colspan="6" class="text-center text-danger py-4">Customers could not be loaded.</td></tr>');
        showMessage("error", getErrorMessage(xhr, "Customers could not be loaded."));
      }
    });
  }

  function getAdminOrders(response) {
    if (response && Array.isArray(response.orders)) {
      return response.orders;
    }

    if (response && response.data && Array.isArray(response.data.orders)) {
      return response.data.orders;
    }

    if (response && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  function renderAdminOrders(orders) {
    const $tbody = $("#adminOrdersTableBody");
    const $empty = $("#adminOrdersEmpty");

    $empty.addClass("d-none");

    if (!Array.isArray(orders) || !orders.length) {
      $tbody.empty();
      $empty.removeClass("d-none");
      return;
    }

    let rows = "";

    $.each(orders, function (_, order) {
      const orderId = Number(order.id || order.order_id) || 0;
      const customer = order.username || order.customer_name || order.email || (order.user && order.user.username) || ("User #" + (order.user_id || "-"));
      const status = order.status || "-";
      const items = Array.isArray(order.items) ? order.items : (Array.isArray(order.products) ? order.products : []);

      if (!items.length) {
        rows += "<tr>";
        rows += "<td class='fw-semibold'>#" + orderId + "</td>";
        rows += "<td>" + escapeHtml(customer) + "</td>";
        rows += "<td class='text-secondary' colspan='4'>No products in this order.</td>";
        rows += "<td></td>";
        rows += "</tr>";
        return;
      }

      $.each(items, function (_, item) {
        const productId = Number(item.product_id || (item.product && item.product.id)) || 0;
        const productName = item.name || item.product_name || (item.product && item.product.name) || "Unknown Product";
        const productPrice = item.price ?? item.product_price ?? (item.product && item.product.price);

        rows += "<tr>";
        rows += "<td class='fw-semibold'>#" + orderId + "</td>";
        rows += "<td>" + escapeHtml(customer) + "</td>";
        rows += "<td>" + escapeHtml(productName) + "</td>";
        rows += "<td class='text-center'>" + (Number(item.quantity) || 0) + "</td>";
        rows += "<td class='text-end'>" + formatPrice(productPrice) + "</td>";
        rows += "<td>" + escapeHtml(status) + "</td>";
        rows += "<td class='text-end'>";
        rows += "<button type='button' class='btn btn-sm btn-outline-danger js-delete-order-product' data-order-id='" + orderId + "' data-product-id='" + productId + "'" + (productId ? "" : " disabled") + ">Delete</button>";
        rows += "</td>";
        rows += "</tr>";
      });
    });

    $tbody.html(rows);
  }

  function loadAdminOrders() {
    const $tbody = $("#adminOrdersTableBody");
    const $empty = $("#adminOrdersEmpty");

    $empty.addClass("d-none");
    $tbody.html('<tr><td colspan="7" class="text-center text-secondary py-4">Orders are loading...</td></tr>');

    return $.ajax({
      url: "backend/api/admin_orders.php",
      method: "GET",
      dataType: "json"
    })
      .done(function (response) {
        if (!isSuccessfulResponse(response)) {
          $tbody.html('<tr><td colspan="7" class="text-center text-danger py-4">Orders could not be loaded.</td></tr>');
          showMessage("error", getResponseMessage(response));
          return;
        }

        renderAdminOrders(getAdminOrders(response));
      })
      .fail(function (xhr) {
        $tbody.html('<tr><td colspan="7" class="text-center text-danger py-4">Orders could not be loaded.</td></tr>');
        showMessage("error", getUnavailableMessage(xhr, "Orders could not be loaded.", "Order management is not available yet."));
      });
  }

  function renderOrders(orderData) {
    const $container = $("#ordersContainer");
    const orders = orderData && Array.isArray(orderData.orders) ? orderData.orders : [];

    if (!orders.length) {
      $container.html('<div class="alert alert-light border mb-0">You do not have any orders yet.</div>');
      return;
    }

    let html = '<div class="accordion" id="ordersAccordion">';

    $.each(orders, function (_, order) {
      const orderId = Number(order.id) || 0;
      const items = Array.isArray(order.items) ? order.items : [];

      html += '<div class="accordion-item">';
      html += '  <h3 class="accordion-header">';
      html += '    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#order-' + orderId + '" aria-expanded="false" aria-controls="order-' + orderId + '">';
      html += '      Order #' + orderId + ' from ' + escapeHtml(order.order_date || "-") + ' - ' + formatPrice(order.total_price);
      html += "    </button>";
      html += "  </h3>";
      html += '  <div id="order-' + orderId + '" class="accordion-collapse collapse" data-bs-parent="#ordersAccordion">';
      html += '    <div class="accordion-body">';
      html += '      <p class="mb-3"><span class="badge text-bg-light border">' + escapeHtml(order.status || "pending") + "</span></p>";
      html += '      <div class="table-responsive"><table class="table table-sm align-middle mb-0">';
      html += "        <thead><tr><th>Product</th><th class='text-center'>Quantity</th><th class='text-end'>Price</th></tr></thead><tbody>";

      $.each(items, function (_, item) {
        html += "<tr>";
        html += "<td>" + escapeHtml(item.name || "Unknown Product") + "</td>";
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
    $container.html('<p class="text-muted mb-0">Orders are loading...</p>');

    return $.ajax({
      url: "backend/api/orders.php",
      method: "GET",
      dataType: "json"
    })
      .done(function (response) {
        if (!isSuccessfulResponse(response)) {
          $container.html('<div class="alert alert-danger mb-0">Orders could not be loaded.</div>');
          showMessage("error", getResponseMessage(response));
          return;
        }

        renderOrders(response && response.data ? response.data : { orders: [] });
      })
      .fail(function (xhr) {
        $container.html('<div class="alert alert-danger mb-0">Orders could not be loaded.</div>');
        showMessage("error", getErrorMessage(xhr, "Orders could not be loaded."));
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

  function translateApiMessage(message) {
    const translations = {
      "Datenbankverbindung fehlgeschlagen.": "Database connection failed.",
      "Ungültige JSON-Eingabe.": "Invalid JSON input.",
      "Ungültige product_id.": "Invalid product ID.",
      "Quantity muss >= 1 sein.": "Quantity must be at least 1.",
      "Produkt nicht gefunden.": "Product not found.",
      "Item hinzugefügt.": "Item added.",
      "Item nicht im Warenkorb.": "Item is not in the cart.",
      "Item entfernt.": "Item removed.",
      "Authentifizierung erforderlich. Bitte einloggen.": "Authentication required. Please log in.",
      "Orders-System noch nicht konfiguriert. DB-Tabellen fehlen.": "The order system is not configured yet.",
      "Orders-System noch nicht konfiguriert.": "The order system is not configured yet.",
      "Ungültiger Status. Nur 0 oder 1 erlaubt.": "Invalid status. Only 0 or 1 is allowed.",
      "Ungültige Benutzer-ID.": "Invalid user ID.",
      "Benutzer nicht gefunden.": "User not found.",
      "Admin-Konten können nicht deaktiviert werden.": "Admin accounts cannot be deactivated.",
      "Benutzerstatus aktualisiert.": "Customer status updated.",
      "Produkt erfolgreich angelegt!": "Product created successfully.",
      "Produkt erfolgreich aktualisiert!": "Product updated successfully.",
      "Produkt erfolgreich gelöscht.": "Product deleted successfully.",
      "Produkt nicht gefunden oder bereits gelöscht.": "Product not found or already deleted."
    };

    return translations[message] || message;
  }

  function hideMessage() {
    $("#messageArea").addClass("d-none").text("");
  }

  function getResponseMessage(response) {
    if (response && response.message) return translateApiMessage(response.message);
    if (response && response.error) return translateApiMessage(response.error);
    return "Operation completed.";
  }

  function getErrorMessage(xhr, fallbackMessage) {
    if (xhr.responseJSON && (xhr.responseJSON.message || xhr.responseJSON.error)) {
      return translateApiMessage(xhr.responseJSON.message || xhr.responseJSON.error);
    }
    try {
      const data = JSON.parse(xhr.responseText);
      return translateApiMessage(data.message || data.error || fallbackMessage);
    } catch (e) {
      return fallbackMessage;
    }
  }

  function getUnavailableMessage(xhr, fallbackMessage, unavailableMessage) {
    if (xhr && (xhr.status === 404 || xhr.status === 405)) {
      return unavailableMessage;
    }

    return getErrorMessage(xhr, fallbackMessage);
  }

  // Navigation and quick-action click handler
  $(document).on("click", "[data-section]", function (event) {
    event.preventDefault();
    const section = $(this).data("section");

    setActiveNav(section);
    setActiveAdminQuickAction(section);

    if (section === "home") {
      checkAuthStatus();
    } else if (section === "account") {
      showSection("#accountSection");
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
    } else if (section === "admin-orders") {
      showSection("#adminOrdersSection");
      loadAdminOrders();
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

    const $submitButton = $(this).find("[type='submit']");
    const data = {
      email: $.trim($("#loginEmail").val()),
      password: $("#loginPassword").val(),
      remember: $("#loginRemember").is(":checked") ? "true" : "false"
    };

    setButtonBusy($submitButton, true);

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
            checkAuthStatus(); // Refreshes the UI
          }, 1000);
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Login failed."));
      }
    }).always(function () {
      setButtonBusy($submitButton, false);
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
    const $submitButton = form.find("[type='submit']");
    const data = {
      username: $.trim($("#registerUsername").val()),
      email: $.trim($("#registerEmail").val()),
      password: $("#registerPassword").val()
    };

    setButtonBusy($submitButton, true);

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
            showSection("#loginSection"); // Switch to the login form
            showMessage("success", "Registration successful. Please log in.");
            $(".nav-link").removeClass("active");
            $("[data-section='login']").addClass("active");
          }, 1500);
        }
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Registration failed."));
      }
    }).always(function () {
      setButtonBusy($submitButton, false);
    });
  });

  // Show the catalog after login
  function showDashboard(username) {
    $(".content-section").hide();
    $("#dashboardSection").fadeIn(150);
    $("#dashboardUsername").text(username);
    $("#accountUsername").text(username);
    loadProductCatalog();
    loadCart();

    // Reset navigation
    setActiveNav("products");

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
    const $submitButton = $(formElement).find("[type='submit']");

    setButtonBusy($submitButton, true);

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
    }).always(function () {
      setButtonBusy($submitButton, false);
    });
  }

  // Build the menu based on the login status
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
          // Not logged in
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
        // Fallback if the server does not respond
        showSection("#homeSection");
      }
    });
  }

  // Logout Handler
  $(document).on("click", "#logoutBtn, #navLogoutBtn", function (event) {
    event.preventDefault();
    hideMessage();

    const $button = $(this);

    if ($button.prop("disabled")) {
      return;
    }

    setButtonBusy($button, true);

    $.ajax({
      url: "backend/api/logout.php",
      method: "POST",
      dataType: "json",
      success: function (response) {
        if (!isSuccessfulResponse(response)) {
          showMessage("error", getResponseMessage(response));
          return;
        }

        checkAuthStatus(); // Reset the menu and view
        setCartSummary({ total_items: 0, total_price: 0 });
        showMessage("success", "You have been logged out.");
      },
      error: function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Logout failed."));
      }
    }).always(function () {
      setButtonBusy($button, false);
    });
  });

  $(document).on('click', '#refreshCustomersBtn', function () {
    const $button = $(this);
    runWithBusyButton($button, loadAdminCustomers);
  });

  $(document).on("click", "#refreshAdminOrdersBtn", function () {
    const $button = $(this);
    runWithBusyButton($button, loadAdminOrders);
  });

  $(document).on("click", "#refreshCartBtn", function () {
    const $button = $(this);
    runWithBusyButton($button, loadCart);
  });

  $(document).on("click", "#ordersBtn, #refreshOrdersBtn", function () {
    const $button = $(this);
    setActiveNav("orders");
    showSection("#ordersSection");
    runWithBusyButton($button, loadOrders);
  });

  $(document).on("click", ".js-product-details", function () {
    const product = productsById[Number($(this).data("product-id"))];

    if (!product) {
      showMessage("error", "Product details could not be loaded.");
      return;
    }

    $("#productDetailsTitle").text(product.name || "Product Details");
    $("#productDetailsImage")
      .attr("src", getProductImagePath(product))
      .attr("alt", product.name || "Product");
    $("#productDetailsDescription").text(product.description || "No description available.");
    $("#productDetailsPrice").text(formatPrice(product.price));
    $("#productDetailsRating").text("★ " + formatRating(product.rating));
    bootstrap.Modal.getOrCreateInstance($("#productDetailsModal")[0]).show();
  });

  $(document).on("click", ".js-add-to-cart", function () {
    const $button = $(this);
    const productId = Number($(this).data("product-id"));

    if ($button.prop("disabled") || !productId) {
      showMessage("error", "Product could not be added to the cart.");
      return;
    }

    setButtonBusy($button, true);

    updateCartItem(productId, 1)
      .done(function (response) {
        if (!isSuccessfulResponse(response)) {
          showMessage("error", getResponseMessage(response));
          return;
        }

        if (response && response.data) {
          setCartSummary(response.data);
        }
        showMessage("success", "Product added to the cart.");
      })
      .fail(function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Product could not be added."));
      })
      .always(function () {
        setButtonBusy($button, false);
      });
  });

  $(document).on("click", ".js-cart-update", function () {
    const $button = $(this);
    const productId = Number($(this).data("product-id"));
    const quantity = Number($(".js-cart-quantity[data-product-id='" + productId + "']").val());

    if ($button.prop("disabled") || !productId || !quantity || quantity < 1) {
      showMessage("error", "Please enter a valid quantity of at least 1.");
      return;
    }

    setButtonBusy($button, true);

    updateCartItem(productId, quantity)
      .done(function (response) {
        if (!isSuccessfulResponse(response)) {
          showMessage("error", getResponseMessage(response));
          return;
        }

        const cartData = response && response.data ? response.data : null;
        if (cartData) {
          renderCart(cartData);
        } else {
          loadCart();
        }
        showMessage("success", "Quantity updated.");
      })
      .fail(function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Quantity could not be updated."));
      })
      .always(function () {
        setButtonBusy($button, false);
      });
  });

  $(document).on("click", ".js-cart-remove", function () {
    const $button = $(this);
    const productId = Number($(this).data("product-id"));

    if ($button.prop("disabled") || !productId) {
      showMessage("error", "Invalid product.");
      return;
    }

    setButtonBusy($button, true);

    removeCartItem(productId)
      .done(function (response) {
        if (!isSuccessfulResponse(response)) {
          showMessage("error", getResponseMessage(response));
          return;
        }

        const cartData = response && response.data ? response.data : null;
        if (cartData) {
          renderCart(cartData);
        } else {
          loadCart();
        }
        showMessage("success", "Product removed from the cart.");
      })
      .fail(function (xhr) {
        showMessage("error", getErrorMessage(xhr, "Product could not be removed."));
      })
      .always(function () {
        setButtonBusy($button, false);
      });
  });

  $(document).on("submit", "#checkoutForm", function (event) {
    event.preventDefault();
    hideMessage();

    const $submitButton = $("#checkoutBuyBtn");
    const address = $.trim($("#checkoutAddress").val());

    if ($submitButton.prop("disabled")) {
      return;
    }

    if (!address) {
      showMessage("error", "Please enter a delivery address.");
      return;
    }

    if (!validateForm("#checkoutForm")) {
      return;
    }

    setButtonBusy($submitButton, true);

    submitOrder(address)
      .done(function (response) {
        if (!isSuccessfulResponse(response)) {
          showMessage("error", getResponseMessage(response));
          return;
        }

        $("#checkoutForm").trigger("reset");
        setCartSummary({ total_items: 0, total_price: 0 });
        showSection("#ordersSection");
        setActiveNav("orders");
        loadOrders();
        showMessage("success", getResponseMessage(response));
      })
      .fail(function (xhr) {
        showMessage("error", getUnavailableMessage(xhr, "Order could not be placed.", "Checkout is not available yet."));
      })
      .always(function () {
        setButtonBusy($submitButton, false);
      });
  });

  $(document).on("click", ".js-toggle-customer-status", function () {
    const $button = $(this);
    const userId = $(this).data("user-id");
    const status = $(this).data("status");

    if ($button.prop("disabled") || !userId) {
      showMessage("error", "Invalid customer selection.");
      return;
    }

    const isDeactivating = Number(status) === 0;
    const confirmed = window.confirm(
      isDeactivating
        ? "Deactivate this customer account?"
        : "Activate this customer account?"
    );

    if (!confirmed) {
      return;
    }

    setButtonBusy($button, true);

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
        showMessage("error", getErrorMessage(xhr, "Customer status could not be updated."));
      }
    }).always(function () {
      setButtonBusy($button, false);
    });
  });

  $(document).on("click", ".js-delete-order-product", function () {
    const $button = $(this);
    const orderId = Number($(this).data("order-id"));
    const productId = Number($(this).data("product-id"));

    if ($button.prop("disabled") || !orderId || !productId) {
      showMessage("error", "Invalid order product selection.");
      return;
    }

    if (!window.confirm("Delete this product from the order?")) {
      return;
    }

    setButtonBusy($button, true);

    $.ajax({
      url: "backend/api/admin_orders.php?order_id=" + encodeURIComponent(orderId) + "&product_id=" + encodeURIComponent(productId),
      method: "DELETE",
      dataType: "json"
    })
      .done(function (response) {
        const isSuccess = response && (response.success === true || response.status === "success");
        showMessage(isSuccess ? "success" : "error", getResponseMessage(response));

        if (isSuccess) {
          loadAdminOrders();
        }
      })
      .fail(function (xhr) {
        showMessage("error", getUnavailableMessage(xhr, "Product could not be removed from the order.", "Order management is not available yet."));
      })
      .always(function () {
        setButtonBusy($button, false);
      });
  });

  $(document).on("submit", "#addProductForm", function (event) {
    event.preventDefault();
    hideMessage();
    if (!validateForm("#addProductForm")) return;
    submitProductForm("#addProductForm", "backend/api/add_product.php", "Product created successfully.");
  });

  $(document).on("submit", "#editProductForm", function (event) {
    event.preventDefault();
    hideMessage();
    if (!validateForm("#editProductForm")) return;
    submitProductForm("#editProductForm", "backend/api/edit_product.php", "Product updated successfully.");
  });

  $(document).on("submit", "#deleteProductForm", function (event) {
    event.preventDefault();
    hideMessage();

    if (!validateForm("#deleteProductForm")) return;

    const $submitButton = $(this).find("[type='submit']");
    const productId = $.trim($("#deleteProductId").val());

    if (!productId) {
      showMessage("error", "Please enter a product ID.");
      return;
    }

    if (!window.confirm("Delete this product?")) {
      return;
    }

    setButtonBusy($submitButton, true);

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
        showMessage("error", getErrorMessage(xhr, "Delete failed."));
      }
    }).always(function () {
      setButtonBusy($submitButton, false);
    });
  });

  // Check the initial authentication status
  checkAuthStatus();
});
