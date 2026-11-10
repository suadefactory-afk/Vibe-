
const feedList = document.getElementById("feedList");
const postText = document.getElementById("postText");
const postButton = document.getElementById("postButton");
const searchInput = document.getElementById("searchInput");
const charCount = document.getElementById("charCount");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

const starterPosts = [
  {
    id: 1,
    name: "Mia K.",
    handle: "@miakreates",
    time: "Just now",
    text: "Starting the week with fresh ideas and positive energy. What is one thing you're looking forward to? ✨",
    likes: 12,
    liked: false
  },
  {
    id: 2,
    name: "The Vibe Team",
    handle: "@vibe",
    time: "Today",
    text: "Welcome to Vibe! This is your space to connect, share your interests and discover new communities. 🌍",
    likes: 24,
    liked: false
  },
  {
    id: 3,
    name: "Jay D.",
    handle: "@jaycreates",
    time: "Yesterday",
    text: "Small steps still move you forward. Keep learning, keep creating and keep being yourself. 💜",
    likes: 8,
    liked: false
  }
];

let posts = loadPosts();

function loadPosts() {
  try {
    const saved = localStorage.getItem("vibe-posts");
    return saved ? JSON.parse(saved) : starterPosts;
  } catch (error) {
    return starterPosts;
  }
}

function savePosts() {
  try {
    localStorage.setItem("vibe-posts", JSON.stringify(posts));
  } catch (error) {
    showToast("Could not save on this device.");
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char])
  );
}

function renderPosts() {
  const query = (searchInput?.value || "").trim().toLowerCase();

  const visible = posts.filter(post =>
    (post.text + " " + post.name + " " + post.handle)
      .toLowerCase()
      .includes(query)
  );

  feedList.innerHTML = visible.map(post => `
    <article class="post-card">
      <div class="post-head">
        <div class="avatar">
          ${escapeHTML(post.name.charAt(0).toUpperCase())}
        </div>

        <div class="post-meta">
          <strong>${escapeHTML(post.name)}</strong>
          <span>
            ${escapeHTML(post.handle)} · ${escapeHTML(post.time)}
          </span>
        </div>
      </div>

      <p class="post-body">${escapeHTML(post.text)}</p>

      <div class="post-actions">
        <button
          class="action-button ${post.liked ? "liked" : ""}"
          data-like="${post.id}"
          aria-label="Like post">
          ♥ ${post.likes} ${post.likes === 1 ? "like" : "likes"}
        </button>

        <button class="action-button" data-share="${post.id}">
          ↗ Share
        </button>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visible.length !== 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timer);

  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

postText.addEventListener("input", () => {
  charCount.textContent = `${postText.value.length} / 500`;
});

postButton.addEventListener("click", () => {
  const text = postText.value.trim();

  if (!text) {
    showToast("Write something before posting.");
    postText.focus();
    return;
  }

  posts.unshift({
    id: Date.now(),
    name: "You",
    handle: "@yourvibe",
    time: "Just now",
    text: text,
    likes: 0,
    liked: false
  });

  savePosts();
  renderPosts();

  postText.value = "";
  charCount.textContent = "0 / 500";

  showToast("Your post has been added!");
});

feedList.addEventListener("click", event => {
  const likeButton = event.target.closest("[data-like]");
  const shareButton = event.target.closest("[data-share]");

  if (likeButton) {
    const post = posts.find(
      item => item.id === Number(likeButton.dataset.like)
    );

    if (post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;

      savePosts();
      renderPosts();
    }
  }

  if (shareButton) {
    const post = posts.find(
      item => item.id === Number(shareButton.dataset.share)
    );

    if (post && navigator.clipboard) {
      navigator.clipboard.writeText(post.text)
        .then(() => showToast("Post text copied!"))
        .catch(() => showToast("Sharing is a future feature."));
    } else {
      showToast("Sharing is a future feature.");
    }
  }
});

searchInput.addEventListener("input", renderPosts);

document.getElementById("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "vibe-theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

if (localStorage.getItem("vibe-theme") === "dark") {
  document.body.classList.add("dark");
}

document.getElementById("worldButton").addEventListener("click", () => {
  showToast("Vibe World is coming soon!");
});

renderPosts();
