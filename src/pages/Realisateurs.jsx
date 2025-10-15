export default function Realisateurs() {
  return (
    <div className="p-8 max-w-3xl mx-auto text-left">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Proposer votre court-métrage
      </h1>
      <p className="mb-6 text-center opacity-80">
        Remplissez ce formulaire pour nous proposer votre film. Notre équipe
        vous contactera pour valider la diffusion et vous envoyer les contrats
        nécessaires.
      </p>

      <form
        action="https://formspree.io/f/mzzjgwyd" // ← remplace par l’URL donnée par Formspree
        method="POST"
        className="space-y-4"
      >
        <input
          type="text"
          name="Nom"
          placeholder="Votre nom / société"
          required
          className="w-full p-2 bg-black border border-gray-700 rounded"
        />
        <input
          type="email"
          name="Email"
          placeholder="Votre email"
          required
          className="w-full p-2 bg-black border border-gray-700 rounded"
        />
        <input
          type="text"
          name="Titre"
          placeholder="Titre du film"
          className="w-full p-2 bg-black border border-gray-700 rounded"
        />
        <input
          type="text"
          name="Lien Vimeo"
          placeholder="Lien Vimeo ou autre"
          className="w-full p-2 bg-black border border-gray-700 rounded"
        />
        <textarea
          name="Message"
          placeholder="Présentez votre projet (synopsis, durée, sélection en festivals, droits…)"
          rows={5}
          className="w-full p-2 bg-black border border-gray-700 rounded"
        ></textarea>

        <button
          type="submit"
          className="px-6 py-3 bg-white text-black rounded hover:bg-white/90"
        >
          Envoyer ma proposition
        </button>
      </form>
    </div>
  );
}
