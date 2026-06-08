(function () {
  var scrollStorageKey = "zhaoolee-sidebar-scroll";
  var modeStorageKey = "zhaoolee-sidebar-mode";
  var defaultMode = "latest";

  function isVisibleInside(container, element) {
    var containerRect = container.getBoundingClientRect();
    var elementRect = element.getBoundingClientRect();
    var padding = 16;

    return (
      elementRect.top >= containerRect.top + padding &&
      elementRect.bottom <= containerRect.bottom - padding
    );
  }

  function keepActiveLinkVisible(sidebar) {
    var activeLink = Array.prototype.slice
      .call(sidebar.querySelectorAll(".sidebar-nav a.active"))
      .find(function (link) {
        return !link.closest("[hidden]");
      });

    if (!activeLink || isVisibleInside(sidebar, activeLink)) {
      return;
    }

    activeLink.scrollIntoView({
      block: "center",
      inline: "nearest",
    });
  }

  function setupSidebarMode(sidebar) {
    var buttons = Array.prototype.slice.call(sidebar.querySelectorAll("[data-sidebar-mode-button]"));
    var panels = Array.prototype.slice.call(sidebar.querySelectorAll("[data-sidebar-panel]"));

    if (buttons.length === 0 || panels.length === 0) {
      return;
    }

    function knownMode(mode) {
      return panels.some(function (panel) {
        return panel.dataset.sidebarPanel === mode;
      });
    }

    function setMode(mode, shouldSave) {
      var nextMode = knownMode(mode) ? mode : defaultMode;

      panels.forEach(function (panel) {
        panel.hidden = panel.dataset.sidebarPanel !== nextMode;
      });

      buttons.forEach(function (button) {
        var isActive = button.dataset.sidebarModeButton === nextMode;
        button.setAttribute("aria-selected", String(isActive));
      });

      if (shouldSave) {
        window.localStorage.setItem(modeStorageKey, nextMode);
      }

      window.requestAnimationFrame(function () {
        keepActiveLinkVisible(sidebar);
      });
    }

    var savedMode = window.localStorage.getItem(modeStorageKey);
    setMode(savedMode || defaultMode, false);

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        setMode(button.dataset.sidebarModeButton, true);
      });
    });
  }

  function setupArticleToc() {
    var toc = document.querySelector(".article-toc");
    var links = toc ? Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']")) : [];

    if (!toc || links.length === 0) {
      return;
    }

    var headings = links
      .map(function (link) {
        var id = decodeURIComponent(link.hash.slice(1));
        var heading = document.getElementById(id);

        return heading ? { heading: heading, link: link } : null;
      })
      .filter(Boolean);

    function setActive(link) {
      links.forEach(function (item) {
        item.classList.toggle("is-active", item === link);
      });

      if (!isVisibleInside(toc, link)) {
        link.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
      }
    }

    function syncActiveLink() {
      var current = headings[0];
      var offset = 96;

      headings.forEach(function (item) {
        if (item.heading.getBoundingClientRect().top <= offset) {
          current = item;
        }
      });

      if (current) {
        setActive(current.link);
      }
    }

    syncActiveLink();
    window.addEventListener("scroll", syncActiveLink, { passive: true });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var succeeded = document.execCommand("copy");
        document.body.removeChild(textarea);
        succeeded ? resolve() : reject(new Error("Copy command failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function setupCodeCopyButtons() {
    var codeBlocks = Array.prototype.slice.call(document.querySelectorAll(".article-content pre > code"));

    codeBlocks.forEach(function (code) {
      var pre = code.parentElement;

      if (!pre || pre.querySelector(".code-copy-button")) {
        return;
      }

      pre.classList.add("code-block-with-copy");

      var button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");

      button.addEventListener("click", function () {
        var originalText = button.textContent;

        copyText(code.textContent || "")
          .then(function () {
            button.textContent = "已复制";
            button.classList.add("is-copied");
          })
          .catch(function () {
            button.textContent = "手动复制";
            button.classList.add("is-failed");
          })
          .finally(function () {
            window.setTimeout(function () {
              button.textContent = originalText;
              button.classList.remove("is-copied", "is-failed");
            }, 1600);
          });
      });

      pre.appendChild(button);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sidebar = document.querySelector(".sidebar");

    if (!sidebar) {
      return;
    }

    setupSidebarMode(sidebar);

    var savedScroll = window.sessionStorage.getItem(scrollStorageKey);
    if (savedScroll !== null) {
      sidebar.scrollTop = parseInt(savedScroll, 10) || 0;
      window.sessionStorage.removeItem(scrollStorageKey);
    }

    window.requestAnimationFrame(function () {
      keepActiveLinkVisible(sidebar);
    });

    sidebar.querySelectorAll(".sidebar-nav a[href]").forEach(function (link) {
      link.addEventListener("click", function () {
        window.sessionStorage.setItem(scrollStorageKey, String(sidebar.scrollTop));
      });
    });

    setupArticleToc();
    setupCodeCopyButtons();
  });
})();
