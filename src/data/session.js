export async function initializeClerk(element) {
  const { clerkKey, clerkDomain } = element.dataset;
  if (!clerkKey || !clerkDomain) throw new Error('Team sign-in is still being configured.');
  const load = (src, attributes = {}) => new Promise((resolve,reject) => {
    const script = document.createElement('script'); script.src = src; script.crossOrigin = 'anonymous';
    Object.entries(attributes).forEach(([key,value]) => script.setAttribute(key,value));
    script.onload = resolve; script.onerror = () => reject(new Error('Could not load sign-in. Please try again.'));
    document.head.appendChild(script);
  });
  await load(`https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`);
  await load(`https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, {'data-clerk-publishable-key':clerkKey});
  await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});
  return window.Clerk;
}
