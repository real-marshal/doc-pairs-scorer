export const MAX_LENGTH = 500

export const setActiveLink = (href) =>
  document.querySelector(`a[href="${href}"]`)?.classList.add('active')

export const renderPagination = ({ currentPage, totalPages, paginationContainer, to }) => {
  const maxPagesToShow = 9
  const pageCount = Math.min(maxPagesToShow, totalPages)
  const shift = Math.max(currentPage - Math.round(maxPagesToShow / 2), 0)
  const initialPage = 1 + shift
  const lastPage = Math.min(pageCount + shift, totalPages)

  const paginationButtons = []

  for (let i = initialPage; i <= lastPage; i++) {
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
