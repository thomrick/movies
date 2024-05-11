<script lang="ts">
  import { onMount } from "svelte";
  import Modal from "./Modal.svelte";

  let user: string;

  let modalRef: HTMLDialogElement;

  onMount(() => {
    const registered = getCookie("Username");

    if (registered) {
      user = registered;
    }

    if (!user) {
      modalRef.showModal();
    }
  });

  const handleSignIn = async () => {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: user }),
    });
    const _data = await response.json();

    document.cookie = `Username=${user}`;
    modalRef.close();
  };

  const getCookie = (cname: string) => {
    const name = cname + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
</script>

<slot />

<dialog bind:this={modalRef}>
  <h1>Welcome to movies!</h1>
  <p>Please enter your name:</p>
  <input type="text" bind:value={user} />
  <button on:click={handleSignIn}>Submit</button>
</dialog>

