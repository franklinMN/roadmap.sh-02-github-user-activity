export async function getEvents(username) {
  return await fetchFromGithub(
    `https://api.github.com/users/${username}/events`,
    username
  );
}

export async function getStarred(username) {
  return await fetchFromGithub(
    `https://api.github.com/users/${username}/starred`,
    username
  );
}

async function fetchFromGithub(url, username) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404)
        throw new Error(`👎 Username: ${username} not found`);
      else
        throw new Error(
          `😵GitHub API error: ${response.status} ${response.statusText}`
        );
    }
    const data = await response.json();
    // console.log(data);
    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch"))
      return { error: "Network error" };
    else return { error: error.message };
  }
}
