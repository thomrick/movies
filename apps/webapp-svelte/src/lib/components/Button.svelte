<script lang="ts">
  export let variant: "primary" | "secondary" | "ghost" = "primary";
  export let disabled = false;
  export let type: "button" | "submit" | "reset"  = "button";
</script>

<button
  class="button"
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  class:ghost={variant === "ghost"}
  on:click
  {disabled}
  {type}
>
  <slot />
</button>

<style>
  .button {
    all: unset;
    box-sizing: border-box;
    height: 46px;
    padding-inline: 16px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .button.primary {
    background-color: var(--color-dark-a);
    color: var(--color-dark-c);
  }
  .button.secondary {
    background-color: var(--color-dark-b);
    color: var(--color-dark-c);
  }
  .button.ghost {
    transition: all 0.3s ease;
    background-color: inherit;
    border-color: var(--color-dark-c);
  }
  .button.ghost:hover {
    background-color: var(--color-dark-c);
    color: var(--color-dark-a);
  }
</style>
