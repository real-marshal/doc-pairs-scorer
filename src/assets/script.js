export const setActiveLink = (href) =>
  document.querySelector(`a[href="${href}"]`)?.classList.add('active')

export const renderPagination = ({ currentPage, totalPages, paginationContainer, to }) => {
  const maxPagesToShow = 10
  const pageCount = Math.min(maxPagesToShow, totalPages)

  const paginationButtons = []

  for (let i = 1; i <= pageCount; i++) {
    const link = document.createElement('a')
    link.href = `${to}?page=${i}`
    link.textContent = i.toString()

    if (i === currentPage) {
      link.classList.add('active')
    }

    paginationButtons.push(link)
  }

  paginationContainer.append(...paginationButtons)
}
